#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Mind-Radar-Edit-Handler.

"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler


class EditHandler(BaseHandler):
    def get(self):
        self.write('<h1>Edit</h1>')
