Steve Harris
2019-11-03

Demo visualisation for EMAP working on time and place

# Running the app

Assumes you are in the mini37 python environment

Assumes data is stored in a database called **mart flow**.
Start postgres `pg_ctl -D . start` from `~/data/postgres`

Then start the websocket_server at the project root 

```python
python3 websocket_server.py
```





# Todo
- [x] @TODO: (2019-11-07) create empty postgres database and table
- [x] @TODO: (2019-11-07) load simulated R data into postgres database
- [x] @TODO: (2019-11-07) modify python websocket server to read from postgres
- [x] @TODO: (2019-11-08) now create a really simple d3 plot that you actually understand; with a variable number of circles that can be in one of two positions
- [x] @TODO: (2019-11-12) @next version needs to maintain an array of current data; then bind to the dom via a key; and update the attributes if needed

- [ ] @TODO: (2019-11-14) draw a path instead of / with the moving circle
- [ ] @TODO: (2019-11-14) use forces to stop the circles overlying each other

- [ ] @TODO: (2019-11-12) final plot idea
      circles on circles; each edge circle represents a ward
      ideally superimposed on an updating chord diagram that records for posterity the main arteries of movement
