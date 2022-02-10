import io
import json
import csv
from os import listdir
from os.path import isfile, join
mypath = 'data/' #set path to folder containing json files

files = [f for f in listdir(mypath) if isfile(join(mypath, f))]
raw = open('raw.csv','w')
csvwriter = csv.writer(raw)
posttest = open('posttest.csv','w')
csvwriter2 = csv.writer(posttest)

head = 0

for f in files: #iterate through files in folder
	if f != ".DS_Store":
		with io.open(mypath+f,'r',encoding='utf-8',errors='ignore') as f:
			content = f.read()
			parsed = json.loads(content)
			subjID = parsed["client"]["sid"]
			subjData = parsed["trials"]
			subjPost = parsed["client"]["posttest"]

			if head == 0:
				header = ["subjID"] #init header array
				header.extend(subjData[0].keys())
				csvwriter.writerow(header)
				header2 = ["subjID","condition"]
				header2.extend(subjPost.keys())
				csvwriter2.writerow(header2)
				head = 1

			for s in subjData:
				vals = [subjID] #init data array
				vals.extend(s.values())
				csvwriter.writerow(vals)

			vals2 = [subjID, parsed["expt"]["catchQuestion"]]
			vals2.extend(subjPost.values())
			csvwriter2.writerow(vals2)
raw.close()
posttest.close()

