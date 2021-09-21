import { Track } from './Track'

export class Album {
  id: number
  title: string
  artist: string
  description: string
  year: number
  tracks: Track[]

  constructor(
    id: number,
    title: string,
    artist: string,
    year: number,
    description: string,
    tracks: Track[]
  ) {
    this.id = id
    this.title = title
    this.artist = artist
    this.description = description
    this.year = year
    this.tracks = tracks
  }
}

