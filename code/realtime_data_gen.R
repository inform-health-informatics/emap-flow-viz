# Steve Harris
# 2019-11-08
# test data for the example realtime script

# recreate the following in R and push into postgres

# #create a bunch of random data for various dimensions we want
# qty = random.randrange(1,4)
# total = random.randrange(30,1000)
# tip = random.randrange(10, 100)
# payType = paymentTypes[random.randrange(0,4)]
# name = namesArray[random.randrange(0,4)]
# spent = random.randrange(1,150)
# year = random.randrange(2012,2016)
# #create a new data point
# point_data = {
#   'quantity': qty,
#   'total' : total,
#   'tip': tip,
#   'payType': payType,
#   'Name': name,
#   'Spent': spent,
#   'Year' : year,
#   'x': time.time()


library(tidyverse)
library(lubridate)
library(DBI)

paymentTypes <-  c("cash", "tab", "visa","mastercard","bitcoin")
namesArray <-  c('Ben', 'Jarrod', 'Vijay', 'Aziz')
nn <- 1e3

df_realtime_test <- data.frame(
#   'quantity': qty,
    quantity = sample.int(4, nn, replace=TRUE)
#   'total' : total,
    ,total = sample(30:1000, nn, replace=TRUE)
#   'tip': tip,
    ,tip = sample(10:100, nn, replace=TRUE)
#   'payType': payType,
    ,payType = sample(paymentTypes, nn, replace=TRUE)
#   'Name': name,
    ,Name = sample(namesArray, nn, replace=TRUE)
#   'Spent': spent,
    ,Spent = sample(1:150, nn, replace=TRUE)
#   'Year' : year,
    ,Year = sample(2012:2016, nn, replace=TRUE)
#   'x': time.time()
    ,x = now() - sample(1:(7*24*3600), nn, replace=TRUE)
)

head(df_realtime_test)

conn <- DBI::dbConnect(RPostgreSQL::PostgreSQL(),
                      dbname = "mart_flow",
                      host = "localhost",
                      user = "steve",
                      password = ""
)


dbListTables(conn)
dbWriteTable(conn, "rt_test", df_realtime_test)
dbListTables(conn)
head(dbReadTable(conn, "rt_test"))

dbDisconnect(conn)
