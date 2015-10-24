#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Mind-Radar.

CreatDB.

DB ver -100

"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import os

from web.util.parse_config import parse_config

config_path = os.path.join(os.path.dirname(__file__), 'config.py')
parse_config(config_path)


from __init__ import version as system_version
from web.db import engine, Base, SessionGen
from web.db import System
from web.db import version as db_version

import re
from getpass import getpass

from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm.exc import NoResultFound


def creat_db(sql_session):
    Base.metadata.create_all(engine)
    session.add_all([
            System('system_version', system_version),
            System('db_version', db_version),
        ])
    session.commit()
    print('資料庫初始化程序完成')


if __name__ == '__main__':
    with SessionGen() as session:
        try:
            info = System.by_key('system_version', session).one()
        except (ProgrammingError, NoResultFound) as e:
            try:
                creat_db(session)
            except KeyboardInterrupt:
                print('\n初始化程序取消')
        else:
            print('資料庫已經初始化，初始化程序停止。如果想要重新初始化，請先清空資料庫。')
