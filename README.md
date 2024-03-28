# NérdyDex 
Just the wannabe version of [Pokmon Showdown](https://www.pokemonshowdown.com) <br/>

## Knock yourself out 
 *[NérdyDex](https://nerdy-dex.vercel.app/)*

## Code Explanation 💬
The code consist of the following components:

### CreateTeamForm.jsx
- input fields that mirror the columns in my airtable. Each input field has a handle change function, which will update the state
and this will be submitted into the Airtable database when `handleSubmit` is called


### ViewTeams.jsx
- Run code for a get request to obtain data from the Airtable and display the content in a table format,
aligning each held item to the corresponding Pokemon. `handleDelete` is also a function that allows
users to delete the `Team` in the Airtable.

### Pokedex.jsx
- A page that allows users to search for Pokemon via the input field. This input will be stored as a state,
which will be used in tandem with PokeApi to display the Pokemon:
  - Name
  - Sprite
  - Type
  - Ability
  - Stats
  - Moves

### Home.jsx
- Just a page that uses `math.random` to display a random Pokemon with its Dex Entry per refresh



## Screenshots 📸
 Just view the page, minimal CSS was done for this project

## Future Enhancements 
- Fuzzy Search to enhance Pokedex Experience
- Link PokeApi to ViewTeams to give users a visual of the Teams they have created
- Input validation via PokeApi when creating Teams
- Upgrade View Teams such that this app is more informative (inspiration from [Marriland Team Builder](https://marriland.com/tools/team-builder/))
