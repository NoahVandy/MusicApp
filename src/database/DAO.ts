import { Album } from "../modles/Album"
import { Artist } from "../modles/Artist"
import { Track } from "../modles/Track"

import * as mysql from "mysql"
import * as util from "util"

export class DAO {
  OK: boolean
  content: Artist | Album | Track
  errorMessage?: string
  pool: any
  host: string
  port: number
  username: string
  password: string
  schema: string

  constructor() {
    this.host = "127.0.0.1"
    this.port = 8889
    this.username = "root"
    this.password = "root"
    this.schema = "MUSIC"
    this.pool = this.initDbConnection()
  }

  private initDbConnection(): any {
    return mysql.createPool({
      host: this.host,
      port: this.port,
      user: this.username,
      password: this.password,
      database: this.schema,
      connectionLimit: 10,
    })
  }

  public async findArtists(callback: any) {
    let artists: Array<Artist> = []

    // Get a pooled connection to the database, run the query to get all the distinct Aritsts, and return an array of the results
    this.pool.getConnection(function (err: any, connection: any) {
      if (err) throw err

      connection.query(
        "SELECT DISTINCT ARTIST FROM ALBUM",
        function (err: any, rows: any, fields: any) {
          connection.release()
          if (err) throw err

          for (let i = 0; i < rows.length; ++i) {
            artists.push(new Artist(i, rows[i].ARTIST))
          }

          callback(artists)
        }
      )
    })
  }
  public async findAlbums(callback: any) {
    let albums: Array<Album> = []
    this.pool.getConnection(async function (err: any, connection: any) {
      connection.release()
      if (err) throw err

      // Use promisify Util to make an async function and run query to get all Albums for specific Artist
      connection.query = util.promisify(connection.query)

      const result = await connection.query("SELECT * FROM ALBUM")

      const t = Promise.all(
        result.map(async (album: any) => {
          const tracks = await connection.query(
            `SELECT * FROM TRACK WHERE ALBUM_ID = ${album.ID}`
          )
          albums.push(
            new Album(
              album.ID,
              album.TITLE,
              album.ARTIST,
              album.YEAR,
              album.DESCRIPTION,
              tracks
            )
          )
        })
      )

      await t
      callback(albums)
    })
  }
  public async findAlbumById(albumId: string, callback: any) {
    let tracks: Array<Track> = []
    let album: Album
    this.pool.getConnection(async function (err: any, connection: any) {
      connection.release()
      if (err) throw err

      // Use promisify Util to make an async function and run query to get all Albums for specific Artist
      connection.query = util.promisify(connection.query)

      const result = await connection.query(
        `SELECT * FROM ALBUM WHERE ID = ${albumId} LIMIT 1`
      )

      // console.log("result", result)

      const t = Promise.all(
        result.map(async (album: any) => {
          const resultTracks = await connection.query(
            `SELECT * FROM TRACK WHERE ALBUM_ID = ${album.ID}`
          )
          tracks = resultTracks
        })
      )

      tracks.map(
        (track: any) =>
          new Track(track.ID, track.TITLE, track.NUMBER, track.LYRICS)
      )

      await t
      album = new Album(
        result[0].ID,
        result[0].TITLE,
        result[0].ARTIST,
        result[0].YEAR,
        result[0].DESCRIPTION,
        tracks
      )

      callback(album)
    })
  }
  public async findAlbumsByArtist(search: string, callback: any) {
    let tracks: Array<Track> = []
    let album: Album
    this.pool.getConnection(async function (err: any, connection: any) {
      connection.release()
      if (err) throw err

      // Use promisify Util to make an async function and run query to get all Albums for specific Artist
      connection.query = util.promisify(connection.query)

      const result = await connection.query(
        `SELECT * FROM ALBUM WHERE ARTIST = "${search}"`
      )

      const t = Promise.all(
        result.map(async (album: any) => {
          const resultTracks = await connection.query(
            `SELECT * FROM TRACK WHERE ALBUM_ID = ${album.ID}`
          )
          tracks = resultTracks
        })
      )

      tracks.map(
        (track: any) =>
          new Track(track.ID, track.TITLE, track.NUMBER, track.LYRICS)
      )

      await t

      try {
        tracks.map(
          (track: any) =>
            new Track(track.ID, track.TITLE, track.NUMBER, track.LYRICS)
        )
        album = new Album(
          result[0].ID,
          result[0].TITLE,
          result[0].ARTIST,
          result[0].YEAR,
          result[0].DESCRIPTION,
          tracks
        )
        callback(album)
      } catch (error) {
        callback([])
      }
    })
  }
  public async findAlbumsByDesc(search: string, callback: any) {
    let tracks: Array<Track> = []
    let album: Album
    this.pool.getConnection(async function (err: any, connection: any) {
      connection.release()
      if (err) throw err

      // Use promisify Util to make an async function and run query to get all Albums for specific Artist
      connection.query = util.promisify(connection.query)

      const result = await connection.query(
        `SELECT * FROM ALBUM WHERE DESCRIPTION = '${search}'`
      )

      const t = Promise.all(
        result.map(async (album: any) => {
          const resultTracks = await connection.query(
            `SELECT * FROM TRACK WHERE ALBUM_ID = ${album?.ID}`
          )
          tracks = resultTracks
        })
      )

      await t

      try {
        tracks.map(
          (track: any) =>
            new Track(track.ID, track.TITLE, track.NUMBER, track.LYRICS)
        )
        album = new Album(
          result[0].ID,
          result[0].TITLE,
          result[0].ARTIST,
          result[0].YEAR,
          result[0].DESCRIPTION,
          tracks
        )
        callback(album)
      } catch (error) {
        callback([])
      }
    })
  }
  public async create(album: Album, callback: Function) {
    this.pool.getConnection(async (err: any, connection: any) => {
      connection.release()
      if (err) throw err

      connection.query(
        `INSERT INTO ALBUM (ID, TITLE, ARTIST, YEAR, IMAGE_NAME, DESCRIPTION) VALUES (null, "${album.title}", "${album.artist}", ${album.year}, "testing.test", "${album.description}")`,
        (err: any, result: any) => {
          if (err) throw err
          callback(result.insertId)
        }
      )
    })
  }

  public async delete(albumId: string, callback: any) {
    const id = Number.parseInt(albumId)
    this.pool.getConnection(async (err: any, connection: any) => {
      connection.release()
      if (err) throw err

      connection.query(
        `DELETE FROM ALBUM WHERE ID = ${id}`,
        (err: any, result: any) => {
          if (err) throw err
          callback(result)
        }
      )
    })
  }
  public async update(album: Album, callback: any) {
    this.pool.getConnection(async (err: any, connection: any) => {
      connection.release()
      if (err) throw err

      connection.query(
        `UPDATE ALBUM set TITLE = "${album.title}", ARTIST = "${album.artist}", YEAR= ${album.year}, IMAGE_NAME = "testing.test", DESCRIPTION = "${album.description}" WHERE ID = ${album.id}`,
        (err: any, result: any) => {
          if (err) throw err
          callback(result)
        }
      )
    })
  }
}
