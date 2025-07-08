module.exports = {
  plugins: [
    require('cssnano')({
      preset: [
        "advanced",
        {
            autoprefixer: false,
            discardComments: {
                removeAllButCopyright: true,
            },
            normalizeString: true,
            normalizeUrl: true,
            normalizeCharset: true,
        },
      ],
    }),
  ],
};
