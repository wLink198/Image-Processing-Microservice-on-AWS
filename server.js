import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';



// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

const COMMON_ERR_MSG = 'The system encountered an error and could not complete your request';
const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];

// IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

/**************************************************************************** */

//! END
app.get("/filteredimage", async (req, res) => {
  const imageUrl = req.query.image_url;
  const validation = validateImage(imageUrl);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.msg });
  }

  try {
    const imagePath = await filterImageFromURL(imageUrl);
    res.sendFile(imagePath, (err) => {
      if (err) {
        res.status(err.status).end();
      } else {
        console.log('Image sent:', imagePath);
        deleteImage(imagePath);
      }
    });
  } catch (error) {
    console.log('Error processing image:', error);
    res.status(500).json({ error: COMMON_ERR_MSG });
  }
});

const validateImage = (imageUrl) => {
  if (!imageUrl) {
    return { valid: false, msg: 'The image_url parameter is required.' };
  }

  const invalidUrlObj = { valid: false, msg: 'The image_url is invalid.' };
  try {
    const parsedUrl = new URL(imageUrl);
    const extension = parsedUrl.pathname.split('.').pop().toLowerCase();
    if (!validExtensions.includes(extension)) {
      return invalidUrlObj;
    }
  } catch (error) {
    return invalidUrlObj;
  }

  return { valid: true };
}

const deleteImage = (imagePath) => {
  try {
    deleteLocalFiles([imagePath]);
    console.log('File deleted:', imagePath);
  } catch (unlinkErr) {
    console.error('Error deleting file:', unlinkErr);
  }
};

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}")
});


// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
