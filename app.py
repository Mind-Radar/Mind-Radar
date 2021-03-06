#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Mind-Radar app."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import os

from web.util.parse_config import parse_config

config_path = os.path.join(os.path.dirname(__file__), 'config.py')
parse_config(config_path)

from web.handler import AppHandler, IndexHandler, ViewHandler, EditHandler
from web.db import SessionGen, System
from web.db import version as db_version

from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm.exc import NoResultFound

from tornado.ioloop import IOLoop
from tornado.web import Application
from tornado.httpserver import HTTPServer
from tornado.options import options


def check_db():
    with SessionGen() as session:
        try:
            db_info = System.by_key('db_version', session).one()
            if db_info.value != db_version:
                raise ValueError('db version error')
        except (ProgrammingError, NoResultFound) as e:
            print(e)
            print('資料庫未初始化。請先初始化資料庫後再啟動系統。')
            exit()
        except ValueError as e:
            print(e)
            print('資料庫版本不符合，請更新或是重新初始化。')
            exit()


def make_app(route):
    return Application(
        handlers = route,
        template_path = os.path.join(os.path.dirname(__file__), 'templates'),
        static_path = os.path.join(os.path.dirname(__file__), 'static'),
        cookie_secret = options.cookie_secret,
        login_url = '/login',
        xsrf_cookies = True,
        debug = options.server_debug,
        autoreload = False,
        # default_handler_class = AppHandler,
    )


if __name__ == '__main__':
    check_db()
    app = make_app([
        (r"/", AppHandler, {'static_path': os.path.join(os.path.dirname(__file__), 'static')}),

        (r"/api", IndexHandler),
        (r"/api/radar/?", ViewHandler),
        (r"/api/radar/edit/?", EditHandler),
    ])
    server = HTTPServer(app, xheaders=True)
    server.listen(options.port)
    IOLoop.current().start()
