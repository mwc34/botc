import json
import os
import requests

path = os.path.dirname(os.path.abspath(__file__))

roles = json.load(open(os.path.join(path, 'roles.json'), encoding='utf-8'))

ref = {r['id'] : r for r in requests.get("https://raw.githubusercontent.com/bra1n/townsquare/main/src/roles.json").json()}

for r in roles:
    if r['id'] in ref:
        r['firstNight'] = ref[r['id']]['firstNight']
        r['otherNight'] = ref[r['id']]['otherNight']
        r['ability'] = ref[r['id']]['ability']

json.dump(roles, open(os.path.join(path, 'roles.json'), 'w+', encoding='utf-8'), indent=4, separators=(',',':'))