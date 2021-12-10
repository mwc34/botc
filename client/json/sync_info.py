import json
import os
import re
import requests

path = os.path.dirname(os.path.abspath(__file__))

roles = json.load(open(os.path.join(path, 'roles.json'), encoding='utf-8'))

ref = {r['id'] : r for r in requests.get("https://raw.githubusercontent.com/bra1n/townsquare/develop/src/roles.json").json()}

for r in roles:
    mutated_id = re.sub(r'-_', '', r['id'])
    if mutated_id in ref:
        r['firstNight'] = ref[mutated_id]['firstNight']
        r['otherNight'] = ref[mutated_id]['otherNight']
        r['ability'] = ref[mutated_id]['ability']

json.dump(roles, open(os.path.join(path, 'roles.json'), 'w+', encoding='utf-8'), indent=4, separators=(',',':'))