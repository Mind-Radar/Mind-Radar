#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Mind-Radar-View-Handler.

"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler


class ViewHandler(BaseHandler):
    def get(self):
        self.write('<h1>View</h1>')
