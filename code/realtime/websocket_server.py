# Steve Harris
# 2019-11-06
# see https://medium.com/@benjaminmbrown/real-time-data-visualization-with-d3-crossfilter-and-websockets-in-python-tutorial-dba5255e7f0e
import time
import random
import json
import datetime
from tornado import websocket, web, ioloop
from datetime import timedelta
from random import randint

import psycopg2
import psycopg2.extras # for dictionary cursor

# paymentTypes = ["cash", "tab", "visa","mastercard","bitcoin"]
# namesArray = ['Ben', 'Jarrod', 'Vijay', 'Aziz']

class WebSocketHandler(websocket.WebSocketHandler):

    # need this to avoid 403 error
    # https://stackoverflow.com/questions/24851207/tornado-403-get-warning-when-opening-websocket?noredirect=1&lq=1
    def check_origin(self, origin):
        return True

    def open(self):
        print('Connection established')
        # ioloop to wait for 3 seconds befoe starting to send data
        ioloop.IOLoop.instance().add_timeout(
            datetime.timedelta(seconds=3),
            self.send_data
        )

    def on_close(self):
        print('Connection closed')

    def send_data(self):
        """
        Function to send new random data to charts
        """


        print("Sending Data")

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
        #     'quantity': qty,
        #     'total' : total,
        #     'tip': tip,
        #     'payType': payType,
        #     'Name': name,
        #     'Spent': spent,
        #     'Year' : year,
        #     'x': time.time()
        # }

        point_data = curs.fetchone()
        point_data = {i[0]:i[1] for i in point_data.items()}
        point_data = json.dumps(point_data,  default=str)

        print(point_data)

        #write the json object to the socket
        self.write_message(point_data)
    
        #create new ioloop instance to intermittently publish data
        ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=1), self.send_data)

if __name__ == "__main__":
    # connection to postgres
    print('Opening connection to PostgreSQL')
    conn = psycopg2.connect(host="localhost",database="mart_flow", user="steve", password="")
    curs = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    SQL = "SELECT * FROM rt_test"
    curs.execute(SQL)

    # create new web app w/ websocket endpoint available at /websocket
    print('Starting websocket server program. Awaiting client request to open socket')
    application = web.Application([(r'/websocket', WebSocketHandler)])
    application.listen(8001)
    ioloop.IOLoop.instance().start()

    print('Closing connection to PostgreSQL')
    curs.close()
    conn.close()
