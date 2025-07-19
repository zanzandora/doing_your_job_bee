import { createGame } from 'odyc';
import './style.css';

const fragment = `
precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_texCoords;

uniform float u_intensity;

void main() {
  vec2 uv = vec2(0.);
  uv.x = v_texCoords.x +sin(v_texCoords.y * 30.) *.1 * u_intensity;
  uv.y = v_texCoords.y +sin(v_texCoords.x * 30.) *.1 * u_intensity;
  gl_FragColor = texture2D(u_texture, uv);
}
`;

const BASE_COLOR = [
  '#212529',
  '#f8f9fa',
  '#ced4da',
  '#228be6',
  '#fa5252',
  '#fcc419',
  '#ff922b',
  '#40c057',
  '#f06595',
  '#a52f01',
];

const TIME_BEFORE_LOSE = 3000;
let score = 0;
/** @type number */
let timeoutIntervalId: number;

let filterIntensity = 0;

const extendedColors = [...BASE_COLOR];

const animation = [
  `
			..........
			..2.2.....
			..2.2.....
			.1505050..
			.05050502.
			.0505050..
			..........
			`,
  `
			..........
			...2.2....
			..2.2.....
			.1505050..
			.05050502.
			.0505050..
			..........
			`,
];

const game = createGame({
  colors: extendedColors,
  player: {
    sprite: animation[0],
    position: [2, 2],
  },

  templates: {
    x: {
      sprite: `
      00000000
      09990999
      09990999
      00000000
      99099909
      00000000
      99909990
      99909990
			`,
    },
    o: {
      sprite: `
			.........
			...888...
			..84448..
			..88888..
			...888...
			....7.77.
			.77.7777.
			.777777..
			..7777...
			.........
	`,
      sound: ['BLIP', 5353],
      onCollide: function (target) {
        target.remove();
        game.setCellAt(...randomPosition(target.position), 'o');
        filterIntensity = filterIntensity === 0 ? 0.1 : filterIntensity * -1.1;
        game.updateFilter({
          intensity: filterIntensity,
        });
        clearTimeout(timeoutIntervalId);
        score++;

        if ([3, 15, 20, 25, 30].includes(score)) {
          clearTimeout(timeoutIntervalId);

          game.openDialog(
            `🎉 Chúc mừng! Bạn đã đạt ${score} điểm! 🎉\nTiếp tục cố gắng nhé!`
          );
        }

        timeoutIntervalId = setTimeout(() => {
          filterIntensity = 0;
          game.updateFilter({
            intensity: filterIntensity,
          });
          game.end('°GAME OVER', 'Score: ' + score);
          score = 0;
        }, TIME_BEFORE_LOSE);
      },
    },
  },
  map: `
  xxxxxxxxx
  x.......x
  x.......x
  x.......x
  x...o...x
  x.......x
  x.......x
  x.......x
  xxxxxxxxx
  `,
  background: 3,
  screenWidth: 9,
  screenHeight: 9,
  filter: {
    fragment,
    settings: {},
  },
  title:
    '~<3> <4>D<5>O<6>I<7>N<8>G<3> <5>Y<5>O<7>U<7>R<8> <3>J<3>O<5>B<5>,<7> <8>B<8>E<5>E<5> <6>!<7> ',
});

/**
 * @param position {[number,number]}
 * @return {[number,number]}
 */
function randomPosition(position: number[]): [number, number] {
  let [x, y] = position;
  let [newX, newY] = [x, y];
  while (
    (newX === x && newY === y) ||
    (newX === game.player.position[0] && newY === game.player.position[1])
  )
    [newX, newY] = [
      Math.floor(Math.random() * 7 + 1),
      Math.floor(Math.random() * 7 + 1),
    ];
  return [newX, newY];
}

game.openDialog(
  `~Hi there~, I'm just a bee  
|
|
I need nectar  
|
|
I fly, I work, I =die=
|
|
_<4>And I love it \\~<4>  
`
);

function animate(now: any) {
  const sprite = animation[Math.floor((now * 3) / 1000) % animation.length];
  if (sprite !== game.player.sprite) {
    game.player.sprite = sprite;
  }
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
