# 2019-11-03
# Steve Harris
# Visualise as moving bubble chart

rm(list=ls())
library(data.table)
library(readr)

# getwd()
# setwd("/Users/steve/code/active/emap-flow-viz")
dt <- read_csv('./data/ADT.csv')
setDT(dt)
dt

head(dt)
setnames(dt, 'resource', 'grp')
setnames(dt, 'activity_time', 'duration')
dt[, pid := parse_number(name)]
head(dt)

tdt <- dt[,.(pid, grp, duration=round(duration))][order(pid)]
tdt <- tdt[pid<101]

# write_csv(tdt,'./data/adt4d3.csv')
write_csv(tdt,'./external/moving-bubbles-tutorial-v2/data/adt4d3.csv')
