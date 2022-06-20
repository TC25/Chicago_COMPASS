setwd('I:/Data/PNNL/Coastal urban proposal/Jiali_WRF')
library(raster)
library(ncdf4)
library(rgdal)
library(dplyr)
library(tidyverse) 
library(sf) 
library(sp) 
library(raster) 


ncin <- nc_open('wrfinput_d01')
print(ncin)

#Load longitude data
lon <- (ncvar_get(ncin,"XLONG"))
nlon <- dim(lon)
head(lon)
lon=as.vector(lon)

#Load latitude data
lat <- (ncvar_get(ncin,"XLAT"))
nlat <- dim(lat)
head(lat)
lat=as.vector(lat)

ncin <- nc_open('WRFV431_UrbanEffect/LakeEffect/tsk_24h_2018_Jun-Aug_BEML_en01_v431.nc')
print(ncin)

#Load relevant variable
TSK <- (ncvar_get(ncin,"TSK"))
nurb <- dim(TSK)
head(TSK)

TSK_sub_max=apply(TSK, c(1,2), max)
TSK_sub_min=apply(TSK, c(1,2), min)

TSK_max=as.vector(TSK_sub_max)-273.15
TSK_min=as.vector(TSK_sub_min)-273.15


ncin <- nc_open('WRFV431_UrbanEffect/LakeEffect/WBGT_24h_2018_Jun-Aug_BEML_en01_v431.nc')
print(ncin)

#Load relevant variable
WBGT <- (ncvar_get(ncin,"WBGT"))
nurb <- dim(WBGT)
head(WBGT)

WBGT_sub_max=apply(WBGT, c(1,2), max)
WBGT_sub_min=apply(WBGT, c(1,2), min)

WBGT_max=as.vector(WBGT_sub_max)
WBGT_min=as.vector(WBGT_sub_min)


ncin <- nc_open('WRFV431_UrbanEffect/LakeEffect/tw2_24h_2018_Jun-Aug_BEML_en01_v431.nc')
print(ncin)

#Load relevant variable
TW2 <- (ncvar_get(ncin,"TW2"))
nurb <- dim(TW2)
head(TW2)

TW2_sub_max=apply(TW2, c(1,2), max)
TW2_sub_min=apply(TW2, c(1,2), min)

TW2_max=as.vector(TW2_sub_max)
TW2_min=as.vector(TW2_sub_min)

ncin <- nc_open('WRFV431_UrbanEffect/LakeEffect/t2_24h_2018_Jun-Aug_BEML_en01_v431.nc')
print(ncin)

#Load relevant variable
T2 <- (ncvar_get(ncin,"T2"))
nurb <- dim(T2)
head(T2)

T2_sub_max=apply(T2, c(1,2), max)
T2_sub_min=apply(T2, c(1,2), min)

T2_max=as.vector(T2_sub_max)-273.15
T2_min=as.vector(T2_sub_min)-273.15


ncin <- nc_open('WRFV431_UrbanEffect/LakeEffect/RH2_24h_2018_Jun-Aug_BEML_en01_v431.nc')
print(ncin)

#Load relevant variable
RH2 <- (ncvar_get(ncin,"RH2"))
nurb <- dim(RH2)
head(RH2)

RH2_sub_max=apply(RH2, c(1,2), max)
RH2_sub_min=apply(RH2, c(1,2), min)

RH2_max=as.vector(RH2_sub_max)
RH2_min=as.vector(RH2_sub_min)


ncin <- nc_open('WRFV431_UrbanEffect/LakeEffect//HI_24h_2018_Jun-Aug_BEML_en01_v431.nc')
print(ncin)

#Load relevant variable
HI <- (ncvar_get(ncin,"HI"))
nurb <- dim(HI)
head(HI)

HI_sub_max=apply(HI, c(1,2), max)
HI_sub_min=apply(HI, c(1,2), min)

HI_max=as.vector(HI_sub_max)
HI_min=as.vector(HI_sub_min)

#Create and save data frame
Dat=data.frame(lon, lat, TSK_max, TSK_min, T2_max, T2_min,  RH2_max, RH2_min,  TW2_max, TW2_min, WBGT_max, WBGT_min)
colnames(Dat)<- c("longitude","latitude","TSK_max", "TSK_min", "T2_max", "T2_min", "RH2_max", "RH2_min",  "TW2_max", "TW2_min", "WBGT_max", "WBGT_min")
write.table (Dat, file = 'Summaries/Summary_modL_en01.csv', sep = ",", dec =".",row.names = F) 
