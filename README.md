# GOV.UK Social Image Generator

Given a URL on GOV.UK, this code generates an image with the title of the page,
to be shared on social networks.

## Requirements

This script is written to work on [GOV.UK PaaS](https://www.cloud.service.gov.uk/)
It requires:
 - `convert` (ImageMagick) to be available on the command line
 - Node 6 or above
 - the GOV.UK font `GDSTransportBold.ttf` in the folder, to render correctly

## How it works

The `social-image.js` file handles the request. It takes a path on GOV.UK, and
grabs the title from the <title> tag.

The script then sets a font size depending on how long the title is, and runs
`convert` (ImageMagick) to create the PNG image.

The script then returns the PNG.
