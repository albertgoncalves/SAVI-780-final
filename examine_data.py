#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import geopandas as gpd
import matplotlib.pyplot as plt


def subway_filename(stem):
    return 'data/subway_{}.geojson'.format(stem)


def selector(gdf, line_col, line_char):
    return gdf.loc[gdf[line_col].str.contains(line_char)].copy()


def select_line(lines, stations, line_char):
    my_lines    = selector(lines   , 'name', line_char)
    my_stations = selector(stations, 'line', line_char)

    return my_lines, my_stations


def add_dash(string):
    return '-{}-'.format(string)


def prepare_data():
    lines    = gpd.read_file(subway_filename('lines'))
    stations = gpd.read_file(subway_filename('entrances'))

    lines['name']    = lines['name'].astype(str)

    stations['name'] = stations['name'].astype(str)
    stations['line'] = stations['line'].astype(str)

    lines['name']    = lines['name'].apply(add_dash)
    lines['name']    = lines['name'].str.replace('-W-' , '-Q-')

    stations['line'] = stations['line'].apply(add_dash)
    stations['line'] = stations['line'].str.replace('-FS-', '-S-')
    stations['line'] = stations['line'].str.replace('-GS-', '-S-')
    stations['line'] = stations['line'].str.replace('-H-' , '-S-')

    return lines, stations


def list_stops():
    return [ '1', '2', '3', '4', '5', '6', '7'
           , 'A', 'B', 'C', 'D', 'E', 'F', 'G'
           , 'J', 'L', 'M', 'N', 'Q', 'R', 'S'
           ]


if __name__ == '__main__':
    lines, stations = prepare_data()
    kwargs = {'column': 'name', 'alpha': 0.25}

    for stop in map(add_dash, list_stops()):
        title = stop.replace('-', '')

        my_lines, my_stations = select_line(lines, stations, stop)

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
