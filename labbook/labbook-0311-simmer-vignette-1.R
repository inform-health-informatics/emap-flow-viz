# 2019-11-03 initial installation along with local compilation
# remotes::install_github("r-simmer/simmer")
install.packages('simmer')
# remotes::install_github("r-simmer/simmer.plot")
# 2019-11-03 above fails with a 'cp: r-simmer-simmer.plot-1a8ac05/docs: No such file or directory ERROR'
install.packages('simmer.plot')
library(simmer)
library(simmer.plot)

# Basic vignette
set.seed(42)

env <- simmer("SuperDuperSim")
env

# Define a trajectory
patient <- trajectory("patients' path") %>%
  ## add an intake activity 
  seize("nurse", 1) %>%
  timeout(function() rnorm(1, 15)) %>%
  release("nurse", 1) %>%
  ## add a consultation activity
  seize("doctor", 1) %>%
  timeout(function() rnorm(1, 20)) %>%
  release("doctor", 1) %>%
  ## add a planning activity
  seize("administration", 1) %>%
  timeout(function() rnorm(1, 5)) %>%
  release("administration", 1)

# Add resources and a generator (creates patients)
env %>%
  add_resource("nurse", 1) %>%
  add_resource("doctor", 2) %>%
  add_resource("administration", 1) %>%
  add_generator("patient", patient, function() rnorm(1, 10, 2))

# see what is going on (nothing yet!)
env %>% peek()

# simmer for 80 time units then check the time
env %>% 
  run(80) %>% 
  now()
# report the next three event times
env %>% peek(3)

# run the simulation step by step
env %>%
  stepn() %>% # 1 step
  print() %>%
  stepn(3)    # 3 steps

# show what is going on
env %>% peek(Inf, verbose=TRUE)
env %>%  run(160) %>% now()
env %>% peek(Inf, verbose=TRUE)

# reset the simulation
env %>% 
  reset() %>% 
  run(800) %>%
  print()

# now parallelise
library(parallel)
envs <- mclapply(1:100, function(i) {
  simmer("SuperDuperSim") %>%
    add_resource("nurse", 1) %>%
    add_resource("doctor", 2) %>%
    add_resource("administration", 1) %>%
    add_generator("patient", patient, function() rnorm(1, 10, 2)) %>%
    run(80) %>%
    wrap()
})

dtt <- envs %>% 
  get_mon_resources()

# quick inspect
library(data.table)
setDT(dtt)
dtt[replication==5 & resource=='nurse']


# now inspect / visualise
library(simmer.plot)

resources <- get_mon_resources(envs)
plot(resources, metric = "utilization")
plot(resources, metric = "usage", c("nurse", "doctor"), items = "server")
head(dtt)


get_palette <- scales::brewer_pal(type = "qual", palette = 1)
library(simmer)

# now inspect trajectories directly
t0 <- trajectory() %>%
  seize("res0", 1) %>%
  branch(function() 1, c(TRUE, FALSE),
         trajectory() %>%
           clone(2,
                 trajectory() %>%
                   seize("res1", 1) %>%
                   timeout(1) %>%
                   release("res1", 1),
                 trajectory() %>%
                   trap("signal",
                        handler=trajectory() %>%
                          timeout(1)) %>%
                   timeout(1)),
         trajectory() %>%
           set_attribute("dummy", 1) %>%
           seize("res2", function() 1) %>%
           timeout(function() rnorm(1, 20)) %>%
           release("res2", function() 1) %>%
           release("res0", 1) %>%
           rollback(11)) %>%
  synchronize() %>%
  rollback(2) %>%
  release("res0", 1)

plot(t0, fill = get_palette)

# end of first vignette
