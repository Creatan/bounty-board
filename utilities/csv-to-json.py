import csv
import json

with open('./bounties.csv', 'r') as csvfile:
  reader = csv.DictReader(csvfile)
  with open('./bounties.json', 'w') as jsonfile:
    jsonfile.write(json.dumps([row for row in reader]))
