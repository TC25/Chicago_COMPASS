//Function to get quality control bits
var getQABits = function(image, start, end, newName) {
    // Compute the bits we need to extract.
    var pattern = 0;
    for (var i = start; i <= end; i++) {
       pattern += Math.pow(2, i);
    }
    // Return a single band image of the extracted QA bits, giving the band
    // a new name.
    return image.select([0], [newName])
                  .bitwiseAnd(pattern)
                  .rightShift(start);
};

//Functions to quality control image collections
var qualityControlDay = function(image){
  var mandatory  = getQABits(image.select('QC_Day'),0,1,'mandatory');
  var quality  = getQABits(image.select('QC_Day'),2,3,'quality');
  var LSTerror  = getQABits(image.select('QC_Day'),6,7,'LSTerror');
  var mask_mandatory = mandatory.lte(1);
  var mask_quality = quality.lte(1);
  var mask_LSTerror = LSTerror.lte(2);
  var Final = image.updateMask(mask_mandatory).updateMask(mask_quality).updateMask(mask_LSTerror);
  return Final.select('LST_Day_1km');

};

var qualityControlNight = function(image){
  var mandatory  = getQABits(image.select('QC_Night'),0,1,'mandatory');
  var quality  = getQABits(image.select('QC_Night'),2,3,'quality');
  var LSTerror  = getQABits(image.select('QC_Night'),6,7,'LSTerror');
  var mask_mandatory = mandatory.lte(1);
  var mask_quality = quality.lte(1);
  var mask_LSTerror = LSTerror.lte(2);
  var Final = image.updateMask(mask_mandatory).updateMask(mask_quality).updateMask(mask_LSTerror);
  return Final.select('LST_Night_1km');

};

var qualityControlMODIS = function(image){
  var mandatory6  = getQABits(image.select('QA'),22,25,'mandatory');
  var mask6 = mandatory6.eq(0);
    var mandatory1  = getQABits(image.select('QA'),2,5,'mandatory');
  var mask1 = mandatory1.eq(0);
    var mandatory2  = getQABits(image.select('QA'),6,9,'mandatory');
  var mask2 = mandatory2.eq(0);
  var Band6 = image.select('sur_refl_b06').updateMask(mask6).multiply(.0001);
  var Band2 = image.select('sur_refl_b02').updateMask(mask2).multiply(.0001);
  var Band1 = image.select('sur_refl_b01').updateMask(mask1).multiply(.0001);
  
  return Band6.addBands(Band2).addBands(Band1)

};

//Load in data and create water mask
var Water = ee.Image("JRC/GSW1_0/GlobalSurfaceWater").select("occurrence");
var notWater = water.mask().not();

//Load feature collection of Chicago's community areas
var ROI = ee.FeatureCollection("users/tirthankar25/Chic_final");

//Load MODIS LST image collection from the Earth Engine data catalog
var MODIS_LST=ee.ImageCollection('MODIS/006/MYD11A2');

//Load MODIS reflectance image collection from the Earth Engine archive
var MODIS=ee.ImageCollection('MODIS/006/MYD09A1');


//Create summer filter
var SumFilter=ee.Filter.dayOfYear(152,244);

//Filter the date range of interest using a date filter and take pixel-wise mean and scale to degree C
var LST_Chicago_day=MODIS_LST.filterDate('2018-01-01','2019-01-01').filter(SumFilter).map(qualityControlDay).mean().multiply(.02).subtract(273.15);
var LST_Chicago_night=MODIS_LST.filterDate('2018-01-01','2019-01-01').filter(SumFilter).map(qualityControlNight).mean().multiply(.02).subtract(273.15);
var MODIS_mean=MODIS.filterDate('2018-01-01','2019-01-01').filter(SumFilter).map(qualityControlMODIS).mean();

//Calculate NDVI
var NDVI_Chicago=MODIS_mean.normalizedDifference(['sur_refl_b02', 'sur_refl_b01'])

//Load in rasters gennerated from WRF outputs
var WRF=ee.Image('users/tirthankar25/WRF_Jiali_modL_new_en01')

//Function to calculate spatial mean value for each feature (community area)
function Neighborhood_mean(feature){

  var reducedNDVI= NDVI_Chicago.reduceRegion({reducer:ee.Reducer.mean(), geometry: feature.geometry(), scale:30})
  var reducedLST_day= LST_Chicago_day.reduceRegion({reducer:ee.Reducer.mean(), geometry: feature.geometry(), scale:30})
  var reducedLST_night= LST_Chicago_night.reduceRegion({reducer:ee.Reducer.mean(), geometry: feature.geometry(), scale:30})
   var reducedWRF= WRF.reduceRegion({reducer:ee.Reducer.mean(), geometry: feature.geometry(), scale:1000})

  return feature.set({'NDVI':reducedNDVI.updateMask(notWater).get('nd'),'MODIS_TSK_Day':reducedLST_day.updateMask(notWater).get('LST_Day_1km'),'MODIS_TSK_Night':reducedLST_day.updateMask(notWater).get('LST_Night_1km'),
  'WRF_TSK_max':reducedWRF.get('TSK_max'),'WRF_TSK_min':reducedWRF.get('TSK_min'),
  'WRF_T2_max':reducedWRF.get('T2_max'),'WRF_T2_min':reducedWRF.get('T2_min'),
    'WRF_RH2_max':reducedWRF.get('RH2_max'),'WRF_RH2_min':reducedWRF.get('RH2_min'),
  'WRF_TW2_max':reducedWRF.get('TW2_max'),'WRF_TW2_min':reducedWRF.get('TW2_min'),
  'WRF_WBGT_max':reducedWRF.get('WBGT_max'),'WRF_WBGT_min':reducedWRF.get('WBGT_min')
  })
}

//Map the function over each community area
var Reduced=ROI.map(Neighborhood_mean)

//Load in data for lake coast
var coast = ee.FeatureCollection("users/tirthankarchakraborty/Great_Lakes/Great_Lakes_Watershed");

//Function to calculate distance from lake coast
function add_distance(feature){
  var centr=feature.geometry().centroid()
  var min_dist=ee.Number(centr.distance(coast, 5))
  return feature.set({'Dist_coast':min_dist,'Lon':centr.coordinates().get(0), 'Lat':centr.coordinates().get(1)})
}

//Map the function over each community area
var Final=Reduced.map(add_distance)

//Export output to Drive in CSV format
Export.table.toDrive({collection:Final, description:'Chicago_WRF_BEML_perc_en01', folder: 'PNNL_Chicago_Jiali', fileFormat: 'CSV'})
