export interface IRatingSystem<TRating> {
  expectedTeams(first: TRating[], second: TRating[]): number

  computeTeams(
    first: TRating[],
    second: TRating[],
    score: number
  ): [newFirst: TRating[], newSecond: TRating[]]

  isCalibrated(rating: TRating): boolean

  getInitialRating(): TRating
}
