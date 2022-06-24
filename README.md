# Chicago_COMPASS
Community area and redlining summaries for Chicago and related scripts. Specifics below:

# Data
Each CSV file (other than the Chicago_redlining files) provides summaries for 77 community areas in Chicago from WRF simulations, satellites, and socioeconomic surveys. The WRF code is open source and can be found at: https://github.com/wrf-model/WRF  

Chicago_control, Chicago_no_urb, and Chicago_no_lake have the maximum and minimum average variables of interest for the control, no urban, and no lake simulations.   

Chicago_perc_control, Chicago_perc_no_urb, and Chicago_perc_no_lake have the 95th and 98th percentiles of hourly variables of interest for the control, no urban, and no lake simulations.   

Chicago_MODIStime_control has the daytime and nighttime variables of interest (corresponding to MODIS Aqua overpass) for the control simulations.   

en01, en02, en03, and so on represent the ensembles for each model configuration.   

Chicago_geo_socioeconomic includes the socioeconomic variables (median income per capita and Hardship Index), spatial metrics (area and distance from the coast), and satellite-derived estimates (daytime and nighttime land surface temperature (LST), and normalized different vegetation index (NDVI).  

The Chicago_redlining files have the maximum and minimum average variables of interest for the control simulations for HOLC graded polygons of Chicago.   

# Scripts
WRF_to_tabular.R converts the WRF simulations into tabular data to be injested into Google Earth Engine.   
Rasterize.js converts the tabular WRF results into a raster with separate bands for each variable on Google Earth Engine.     
Summarize.js processeses satellite observations and summarizes the satellite and WRF outputs into regions of interest on Google Earth Engine.     
