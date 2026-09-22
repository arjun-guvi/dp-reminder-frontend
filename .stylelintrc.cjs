module.exports = {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'selector-class-pattern': null,
    'declaration-block-trailing-semicolon': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen'],
      },
    ],
    'scss/percent-placeholder-pattern': null,
    'no-descending-specificity': null,
    'rule-empty-line-before': null,
    'comment-empty-line-before': null,
    'declaration-empty-line-before': null,
    'scss/at-extend-no-missing-placeholder': null,
    'scss/no-global-function-names': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'font-family-name-quotes': null,
    'color-hex-length': null,
  },
};
