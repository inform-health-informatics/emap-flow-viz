# Steve Harris
# 2019-11-03
# Theme hospital patient flow generator
# All times are in hours

rm(list=ls())
library(simmer)
library(simmer.plot)
library(data.table)
library(ggplot2)
library(janitor)

set.seed(3001)

# Set-up constants
LOS_MEAN_ED <-  4
LOS_MEAN_ICU <- 48 
LOS_MEAN_AMU <- 24
LOS_MEAN_T8 <- 96

N_PATIENTS <- 1e3


how_ill_in_ED <- function() {
  # Use this function to define paths by probability
  # return severity on interger scale for branching logic
  # 1 = not sick; hence discharge
  # 2 = sick; hence admit
  # 3 = very sick; hence ICU
  # sample.int(c(1:3), 1)
  # assign probabilites to the 3 paths above
  sample.int(3, 1, prob=c(0.5,0.4,0.1))
}

# qplot(replicate(1e2, how_ill_in_ED()))
# summary(rexp(1e3,1))

# bank server version but with infinite resources
patient <-
  trajectory("Patients's path") %>%
  # ED
  # =====
log_("ED arrive") %>%
  seize("ED") %>%
  timeout(function() rexp(1,1/2)) %>%
  release("ED") %>%
  
  # ========================
# ED branching logic STARTS
# ========================

branch(
  how_ill_in_ED, continue=c(FALSE, TRUE, TRUE),
  # ---
  trajectory() %>% 
    log_("Discharge from ED"),
  # ---
  trajectory() %>% 
    # AMU
    # =====
  log_("AMU arrive") %>%
    seize("AMU") %>%
    timeout(function() LOS_MEAN_AMU*rexp(1,1)) %>%
    release("AMU"),
  # ---
  trajectory() %>% 
    # ICU
    # =====
  log_("ICU arrive") %>%
    seize("ICU") %>%
    timeout(function() LOS_MEAN_ICU*rexp(1,1)) %>%
    release("ICU")
) %>%
  
  # ========================
# ED branching logic STOPS
# ========================

# T8
# =====
log_("T8 arrive") %>%
  seize("T8") %>%
  timeout(function() LOS_MEAN_T8*rexp(1,1)) %>%
  release("T8") %>%
  # Discharge
  # ====
log_(function() {paste("Finished: ", now(hospital))})

get_palette <- scales::brewer_pal(type = "qual", palette = 1)
plot(patient, fill = get_palette)

# return a vector of patient arrival times
generator_vector <- c(0, rexp(N_PATIENTS-1, 1/10), -1)

hospital <-
  simmer("hospital") %>%
  add_resource("ED", capacity=+Inf) %>% 
  add_resource("AMU", capacity=+Inf) %>% 
  add_resource("ICU", capacity=+Inf) %>% 
  add_resource("T8", capacity=+Inf) %>% 
  # one customer add_generator("Patient", patient, at(rexp(1, 1/5))) many
  # customers the function() {c(0, rexp(4, 1/10), -1)}) creates a vector with 6
  # items starting at 0; the -1 in the generator stops it
  add_generator("Patient", patient, function() {generator_vector}, mon=2)


hospital %>%  reset() %>%  run() %>% print()
dt_pts <- setDT(hospital %>% get_mon_arrivals(per_resource=TRUE))
dt_pts[order(name)]
dt_pts %>% tabyl(resource)

library(readr)
readr::write_csv(dt_pts, 'data/ADT.csv')


# dt_res <- setDT(hospital %>% get_mon_resources())
# dt_res[order(resource)]
