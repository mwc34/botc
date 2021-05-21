import json
import os

path = os.path.dirname(os.path.abspath(__file__))

def update(fn, on):
    roles = json.load(open(os.path.join(path, 'roles.json'), encoding='utf-8'))
    
    for r in roles:
        if fn and r['firstNight'] >= fn:
            r['firstNight'] += 1
        if on and r['otherNight'] >= on:
            r['otherNight'] += 1
            
    json.dump(roles, open(os.path.join(path, 'roles.json'), 'w+', encoding='utf-8'))