#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import matplotlib.pyplot as plt
import pandas as pd

from examine_data import add_dash
from examine_data import prepare_data
from examine_data import selector


def select_2_lines(lines, stations, selection):

    def map_selection():
        return map(add_dash, selection)

    my_lines = pd.concat([ selector(lines, 'name', line_char)
                           for line_char in map_selection()
                         ]
                        ).copy()

    my_stations = stations.copy()

    for selected in map_selection():
        my_stations = \
            my_stations.loc[stations['line'].str.contains(selected)].copy()

    return my_lines, my_stations


if __name__ == '__main__':
    lines, stations = prepare_data()
    kwargs = {'column': 'name', 'alpha': 0.25}

    selections = [ ['R', 'N', 'D']
                 , ['6', 'M', 'E']
                 , ['Q', 'D', 'R']
                 , ['4', 'R']
                 , ['5', 'L']
                 , ['G', 'L']
                 ]

    for selection in selections:
        title = '-'.join(sorted(selection))

        my_lines, my_stations = select_2_lines(lines, stations, selection)

        fig, ax = plt.subplots(figsize=(5, 6.5))
        kwargs['ax'] = ax

        my_lines.plot(**kwargs)

        if len(my_stations) > 0:
            my_stations.plot(**kwargs)

        ax.set_title(title)
        ax.set_aspect('equal')

        plt.tight_layout()
        plt.savefig('tmp/{}.png'.format(title))
        plt.close()
