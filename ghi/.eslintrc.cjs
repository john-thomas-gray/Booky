module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: [
        'dist',
        '.eslintrc.cjs',
        '**/components/MeetingPage.jsx',
        '**/components/UserPage.jsx',
        '**/components/Betting.jsx',
        '**/components/ClubDetailPage.jsx',
        '**/components/CreateMeetingForm.jsx',
        '**/components/FriendRequestPage.jsx',
        '**/components/ListMeetings.jsx',
    ],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    settings: { react: { version: '18.2' } },
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        'react/prop-types': [0],
    },
}
