# Steve Harris
# Learn r2d3
# r2d3: https://rstudio.github.io/r2d3

rm(list=ls())
library(r2d3)
getwd()
setwd('labbook')
# Not happy if not running in same directory as code
r2d3(data=c(0.3, 0.6, 0.8, 0.95, 0.40, 0.20), script = "barchart.js", viewer="browser")

