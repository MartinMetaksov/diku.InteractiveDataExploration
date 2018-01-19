import reverse_geocoder as rg
import csv

coords = []
with open('scrubbed.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')

    for row in reader:
        try:
            lat = float(row[9])
            lon = float(row[10])
            coords.append((lat, lon))

        except ValueError:
            continue

print('Loaded', len(coords), 'coordinates')

places = rg.search(coords)

print('Resolved', len(places), 'places')

with open('dataset.csv', 'w', newline='') as outfile:
    writer = csv.writer(outfile, delimiter=',')

    with open('scrubbed.csv', newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        i = 0
        for row in reader:
            try:
                lat = float(row[9])
                lon = float(row[10])

                row[1] = places[i]['name']
                row[2] = places[i]['admin1']
                row[3] = places[i]['cc']
                i += 1

                try:
                    sec = int(row[5])
                except ValueError:
                    sec = 0

                row[5] = sec

                if not row[4]:
                    row[4] = 'unknown'

                writer.writerow(row)

            except ValueError:
                if row[0] == 'dt':
                    writer.writerow(row)
                continue
