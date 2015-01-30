import tornado.ioloop
import tornado.web
import os
import sys


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world mind radar!!FFF")


settings = {
    'template_path'  : os.path.join(os.path.dirname(__file__), 'templates'),
    'static_path'    : os.path.join(os.path.dirname(__file__), 'static'),
    'cookie_secret'  : 'iafjo3i4j909-awjg23ru09aa38*Y#(*Rh',
    'login_url'      : '/login',
    'debug'          : True,
}


application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/index.py", MainHandler),
],**settings)


if __name__ == "__main__":
    port = int(sys.argv[1])
    application.listen(port)
    tornado.ioloop.IOLoop.instance().start()
