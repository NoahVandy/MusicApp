const express = require("express")
const app = express()
const port = 3000
const cors = require("cors")

import { Request, Response } from "express"
import { DAO } from "./database/DAO"
import { Album } from "./modles/Album"
import { Artist } from "./modles/Artist"

app.use(cors())
app.use(express.json())

app.get("/artists", (req: Request, res: Response) => {
  const db = new DAO()
  db.findArtists((artists: Array<Artist>) => {
    if (artists) {
      res.status(200).send({
        artists: artists,
        numberOfResults: artists.length + 1,
      })
    }
  })
})

app.get("/albums", (req: Request, res: Response) => {
  const db = new DAO()
  db.findAlbums((albums: Array<Album>) => {
    if (albums) {
      res.status(200).send({
        albums: albums,
      })
    }
  })
})

app.get("/albums/:albumId", (req: Request, res: Response) => {
  const db = new DAO()
  db.findAlbumById(req.params.albumId, (album: Album) => {
    if (album) {
      res.status(200).send({
        album: album,
      })
    }
  })
})

app.get("/albums/search/artist/:search", (req: Request, res: Response) => {
  const db = new DAO()
  db.findAlbumsByArtist(req.params.search, (albums: Array<Album>) => {
    if (albums) {
      res.status(200).send({
        albums: albums,
      })
    }
  })
})

app.get("/albums/search/description/:search", (req: Request, res: Response) => {
  const db = new DAO()
  db.findAlbumsByDesc(req.params.search, (albums: Array<Album>) => {
    if (albums) {
      res.status(200).send({
        albums: albums,
      })
    }
  })
})

app.post("/albums", (req: Request, res: Response) => {
  const db = new DAO()
  const album = new Album(
    null,
    req.body.title,
    req.body.artist,
    req.body.year,
    req.body.description,
    req.body.tracks
  )
  db.create(album, (created: any) => {
    if (created) {
      res.sendStatus(201)
    }
  })
})

app.delete("/albums/:albumId", (req: Request, res: Response) => {
  const db = new DAO()
  db.delete(req.params.albumId, (created: any) => {
    if (created) {
      if (created.affectedRows === 1) {
        res.sendStatus(200)
      } else {
        res.sendStatus(409)
      }
    }
  })
})

app.put("/albums/:albumId", (req: Request, res: Response) => {
  const db = new DAO()
  const album = new Album(
    req.body.id,
    req.body.title,
    req.body.artist,
    req.body.year,
    req.body.description,
    req.body.tracks
  )
  db.update(album, (created: any) => {
    if (created) {
      if (created.affectedRows === 1) {
        res.sendStatus(200)
      } else {
        res.sendStatus(409)
      }
    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
