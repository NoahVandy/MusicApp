export class Track {
  id: number
  title: string
  number: number
  lyrics: string

  constructor(
    id: number,
    title: string,
    number: number,
    lyrics: string
  ) {
    this.id = id
    this.title = title
    this.number = number
    this.lyrics = lyrics
  }
}