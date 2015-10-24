#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Mind-Radar-handler-init.

TODO: update.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from ..db import SQL_Session#, User, GroupList, Login_Session
# from ..util  import webassets_react

import functools
import os
# from webassets import Environment, Bundle

import tornado.web
from tornado.escape import json_encode
from tornado.options import options


class BaseHandler(tornado.web.RequestHandler):
    def initialize(self, is_api=True):
        self.is_api = is_api

    def prepare(self):
        """This method is executed at the beginning of each request.

        """
        self.sql_session = SQL_Session()

    def on_finish(self):
        """Finish this response, ending the HTTP request 
        and properly close the database.
        """
        try:
            self.sql_session.close()
        except AttributeError:
            pass

    def get_current_user(self):
        """Gets the current user logged in from the cookies
        If a valid cookie is retrieved, return a User object.
        Otherwise, return None.
        """
        return None
        # session_key = self.get_secure_cookie('session_key')
        # if not session_key:
        #     return None
        # login_session = Login_Session.get_by_key(session_key, self.sql_session)
        # if not login_session:
        #     return None
        # return User.by_key(login_session.userkey, self.sql_session).scalar()

    def get_template_namespace(self):
        _ = super(BaseHandler, self).get_template_namespace()
        
        # self.assets = Environment(
        #         os.path.join(os.path.dirname(__file__), '../static'),'/static')
        # css_all = Bundle(
        #         'css/bootstrap.min.css',
        #         'css/material.min.css',
        #         Bundle('css/schoolcms.css','css/dropdown.css', filters='cssmin'),
        #         'outdatedbrowser/outdatedbrowser.min.css',
        #         output='dict/plugin.min.css')
        # js_all = Bundle(
        #         Bundle(
        #             'outdatedbrowser/outdatedbrowser.min.js',
        #             'react-0.13.2/react-with-addons.min.js',
        #             'js/jquery-2.1.3.min.js',
        #             'js/bootstrap.min.js',
        #             'js/react-bootstrap.min.js',
        #             'js/react-mini-router.min.js',
        #             'js/marked.min.js',
        #             'js/material.min.js',
        #             'js/isMobile.min.js',
        #             'js/moment-with-locales.min.js',
        #             'js/dropdown.js',filters='jsmin'),
        #         Bundle(
        #             'schoolcms/init.jsx',
        #             'schoolcms/mixin/*.jsx',
        #             'schoolcms/component/*.jsx',
        #             'schoolcms/page/*.jsx', filters=('react','jsmin')),
        #         output='dict/plugin.min.js')
        # self.assets.register('css_all', css_all)
        # self.assets.register('js_all', js_all)

        # _['css_urls'] = self.assets['css_all'].urls()
        # _['js_urls'] = self.assets['js_all'].urls()

        # _['current_user'] = self.current_user.to_dict() if self.current_user else None
        # _['current_groups'] = groups

        # Call this to set the cookie
        self.xsrf_token

        return _

    @property
    def HTTPError(self):
        return tornado.web.HTTPError
    
    def write_error(self, error, **kargs):
        # self.render('error.html')
        self.write('<h1>Geez, ERROR:%s</h1>' % error)

    @staticmethod
    def authenticated(method):
        return tornado.web.authenticated(method)


class AppHandler(BaseHandler):
    def get(self):
        self.render('app.html')


# from .indexhandler import IndexHandler
