

//Load in grid-wise WRF-simulated variables
var table = ee.FeatureCollection("users/tirthankar25/Summary_bem_en05");

//Function to generate feature collection with 4 km grids.
function fill_her_Lp(feature){
  return feature.setGeometry(feature.geometry().buffer(2000).bounds())
}

//Map function over each model grid center
var Filled=table.map(fill_her_Lp)

//Rasterize data
var Img=Filled.reduceToImage({properties:['TSK_max'], reducer:ee.Reducer.first()}).select(['first'],['TSK_max'])
.addBands(Filled.reduceToImage({properties:['TSK_min'], reducer:ee.Reducer.first()}).select(['first'],['TSK_min']))
.addBands(Filled.reduceToImage({properties:['T2_max'], reducer:ee.Reducer.first()}).select(['first'],['T2_max']))
.addBands(Filled.reduceToImage({properties:['T2_min'], reducer:ee.Reducer.first()}).select(['first'],['T2_min']))
.addBands(Filled.reduceToImage({properties:['TW2_max'], reducer:ee.Reducer.first()}).select(['first'],['TW2_max']))
.addBands(Filled.reduceToImage({properties:['TW2_min'], reducer:ee.Reducer.first()}).select(['first'],['TW2_min']))
.addBands(Filled.reduceToImage({properties:['RH2_max'], reducer:ee.Reducer.first()}).select(['first'],['RH2_max']))
.addBands(Filled.reduceToImage({properties:['RH2_min'], reducer:ee.Reducer.first()}).select(['first'],['RH2_min']))
.addBands(Filled.reduceToImage({properties:['Q2_max'], reducer:ee.Reducer.first()}).select(['first'],['Q2_max']))
.addBands(Filled.reduceToImage({properties:['Q2_min'], reducer:ee.Reducer.first()}).select(['first'],['Q2_min']))
.addBands(Filled.reduceToImage({properties:['WBGT_max'], reducer:ee.Reducer.first()}).select(['first'],['WBGT_max']))
.addBands(Filled.reduceToImage({properties:['WBGT_min'], reducer:ee.Reducer.first()}).select(['first'],['WBGT_min']))

//Export image to asset
Export.image.toAsset({image: Img, description: 'Export', assetId: 'WRF_Jiali_bem_new_en05', region:table.geometry().bounds(), scale:4000, maxPixels:999999999999})

