rm(list=ls())
library(simmer)
library(simmer.plot)
library(data.table)

set.seed(3001)

# art gallery version of example where there are no resources just locations
patient <-
  trajectory("Patient's trajectory") %>%
  log_("I'm sick; arrive ED") %>%
  set_attribute("location", 123 ) %>% 
  timeout(function() rexp(1, 1/4)) %>%
  log_("Transfer to ward") %>%
  timeout(10) %>%
  log_("I'm better; discharge from hospital")

hospital <-
  simmer("hospital") %>%
  # one customer add_generator("Patient", patient, at(rexp(1, 1/5))) many
  # customers the function() {c(0, rexp(4, 1/10), -1)}) creates a vector with 6
  # items starting at 0; the -1 in the generator stops it
  add_generator("Patient", patient, function() {c(0, rexp(4, 1/10), -1)}, mon=2)


hospital %>%  reset() %>%  run(100) %>% print()
hospital %>% get_mon_arrivals()
hospital %>% get_mon_attributes()


how_ill_in_ED <- function() {
  # return severity on interger scale for branching logic
  # 0 = not sick; hence discharge
  # 1 = sick; hence admit
  # 2 = very sick; hence ICU
  sample(c(1:3), 1)
}
replicate(10, how_ill_in_ED())

# bank server version but with infinite resources
patient <-
  trajectory("Patients's path") %>%
  # ED
  # =====
  log_("ED arrive") %>%
  seize("ED") %>%
  timeout(12) %>%
  release("ED") %>%
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
      timeout(12) %>%
      release("AMU"),
    # ---
    trajectory() %>% 
      # ICU
      # =====
      log_("ICU arrive") %>%
      seize("ICU") %>%
      timeout(12) %>%
      release("ICU")
    ) %>%
  # T8
  # =====
  log_("T8 arrive") %>%
  seize("T8") %>%
  timeout(12) %>%
  release("T8") %>%
  # Discharge
  # ====
  log_(function() {paste("Finished: ", now(hospital))})

get_palette <- scales::brewer_pal(type = "qual", palette = 1)
plot(patient, fill = get_palette)

hospital <-
  simmer("hospital") %>%
  add_resource("ED", capacity=+Inf) %>% 
  add_resource("AMU", capacity=+Inf) %>% 
  add_resource("ICU", capacity=+Inf) %>% 
  add_resource("T8", capacity=+Inf) %>% 
  # one customer add_generator("Patient", patient, at(rexp(1, 1/5))) many
  # customers the function() {c(0, rexp(4, 1/10), -1)}) creates a vector with 6
  # items starting at 0; the -1 in the generator stops it
  add_generator("Patient", patient, function() {c(0, rexp(5, 1/10), -1)}, mon=2)


hospital %>%  reset() %>%  run(100) %>% print()
dt_pts <- setDT(hospital %>% get_mon_arrivals(per_resource=TRUE))
dt_pts[order(name)]



dt_res <- setDT(hospital %>% get_mon_resources())
dt_res[order(resource)]
