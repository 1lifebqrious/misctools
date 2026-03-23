import type { NoobPracticeQuestion, ProPracticeQuestion } from "../types";

export const NOOB_QUESTIONS: NoobPracticeQuestion[] = [
  {
    id: "noob-01",
    level: "noob",
    prompt:
      "Two classmates put the same amount of money into a class jar. There were already $5 in the jar, and now there is $15 altogether. How much did each classmate add?",
    expected: { variableSide: "left", leftOperand: 2, operator: "+", rightOperand: 5, result: 15 }
  },
  {
    id: "noob-02",
    level: "noob",
    prompt:
      "A teacher gives 3 identical bonus cards and then adds 6 extra points. The final score is 18 points. How many points is each bonus card worth?",
    expected: { variableSide: "left", leftOperand: 3, operator: "+", rightOperand: 6, result: 18 }
  },
  {
    id: "noob-03",
    level: "noob",
    prompt:
      "Four classmates each put the same amount of money on top of the $8 already in their class piggy bank. Together they can buy a teacher gift that costs $12. How much did each friend contribute?",
    expected: { variableSide: "left", leftOperand: 4, operator: "-", rightOperand: 8, result: 12 }
  },
  {
    id: "noob-04",
    level: "noob",
    prompt:
      "Lara already has 7 stickers. Then she gets 2 identical sticker packs and ends up with 13 stickers. How many stickers are in each pack?",
    expected: { variableSide: "right", leftOperand: 7, operator: "+", rightOperand: 2, result: 13 }
  },
  {
    id: "noob-05",
    level: "noob",
    prompt:
      "Mika has saved $9. After adding the cost of 1 notebook, the total spending becomes $14. How much does the notebook cost?",
    expected: { variableSide: "right", leftOperand: 9, operator: "+", rightOperand: 1, result: 14 }
  },
  {
    id: "noob-06",
    level: "noob",
    prompt:
      "A game starts at 6 points. Then 4 identical bonus cards are added and the score becomes 10. How many points is each bonus card worth?",
    expected: { variableSide: "right", leftOperand: 6, operator: "+", rightOperand: 4, result: 10 }
  },
  {
    id: "noob-07",
    level: "noob",
    prompt:
      "A game begins with 10 points. After 2 equal score changes, the player has only 4 points left. What was each score change?",
    expected: { variableSide: "left", leftOperand: 2, operator: "+", rightOperand: 10, result: 4 }
  },
  {
    id: "noob-08",
    level: "noob",
    prompt:
      "A diver starts at 11 meters above sea level. After 3 equal moves, the diver is at 2 meters. What was each move in meters?",
    expected: { variableSide: "right", leftOperand: 11, operator: "+", rightOperand: 3, result: 2 }
  },
  {
    id: "noob-09",
    level: "noob",
    prompt:
      "A thermometer reads 6°C. After 5 equal temperature changes, it reads 4°C. What was each change in degrees?",
    expected: { variableSide: "left", leftOperand: 5, operator: "+", rightOperand: 6, result: 4 }
  },
  {
    id: "noob-10",
    level: "noob",
    prompt:
      "Three identical ribbon pieces are measured together, and 3 centimeters are trimmed off. The remaining total length is 9 centimeters. How long was each ribbon piece before trimming?",
    expected: { variableSide: "left", leftOperand: 3, operator: "-", rightOperand: 3, result: 9 }
  },
  {
    id: "noob-11",
    level: "noob",
    prompt:
      "A player starts a round with 8 points. Then 2 equal score changes happen and the player ends with 6 points. What was each score change?",
    expected: { variableSide: "right", leftOperand: 8, operator: "+", rightOperand: 2, result: 6 }
  },
  {
    id: "noob-12",
    level: "noob",
    prompt:
      "Four identical notebooks and a $1 folder together cost $17. How much does each notebook cost?",
    expected: { variableSide: "left", leftOperand: 4, operator: "+", rightOperand: 1, result: 17 }
  },
  {
    id: "noob-13",
    level: "noob",
    prompt:
      "A game score is 10. After one final score change, the player ends at 3. What was that score change?",
    expected: { variableSide: "right", leftOperand: 10, operator: "+", rightOperand: 1, result: 3 }
  },
  {
    id: "noob-14",
    level: "noob",
    prompt:
      "Two equal wood pieces are cut, and 4 centimeters are removed from their total length. The remaining total is 8 centimeters. How long was each wood piece before cutting?",
    expected: { variableSide: "left", leftOperand: 2, operator: "-", rightOperand: 4, result: 8 }
  },
  {
    id: "noob-15",
    level: "noob",
    prompt:
      "There are already 6 marbles in a box. Then 3 identical bags of marbles are poured in, and the box now holds 15 marbles. How many marbles were in each bag?",
    expected: { variableSide: "right", leftOperand: 6, operator: "+", rightOperand: 3, result: 15 }
  }
];

export const PRO_QUESTIONS: ProPracticeQuestion[] = [
  {
    id: "pro-01",
    level: "pro",
    prompt:
      "At the school fair, one sandwich costs X dollars and one juice costs Y dollars. Together they cost $10. The sandwich costs $2 more than the juice. Build both equations.",
    expected: [
      { xCoefficient: 1, operator: "+", yCoefficient: 1, result: 10 },
      { xCoefficient: 1, operator: "-", yCoefficient: 1, result: 2 }
    ]
  },
  {
    id: "pro-02",
    level: "pro",
    prompt:
      "A juice costs X dollars and a cookie costs Y dollars. One juice and 2 cookies cost $7. The juice costs $4 more than one cookie. Build both equations.",
    expected: [
      { xCoefficient: 1, operator: "+", yCoefficient: 2, result: 7 },
      { xCoefficient: 1, operator: "-", yCoefficient: 1, result: 4 }
    ]
  },
  {
    id: "pro-03",
    level: "pro",
    prompt:
      "One pen costs X dollars and one notebook costs Y dollars. Buying 2 pens and 1 notebook costs $11. A pen costs $1 more than a notebook. Build both equations.",
    expected: [
      { xCoefficient: 2, operator: "+", yCoefficient: 1, result: 11 },
      { xCoefficient: 1, operator: "-", yCoefficient: 1, result: 1 }
    ]
  },
  {
    id: "pro-04",
    level: "pro",
    prompt:
      "Let X be the morning temperature change and Y be the afternoon temperature change. Together the day changes by 2°C. If the afternoon change happened twice, the total change would be only 1°C. Build both equations.",
    expected: [
      { xCoefficient: 1, operator: "+", yCoefficient: 1, result: 2 },
      { xCoefficient: 1, operator: "+", yCoefficient: 2, result: 1 }
    ]
  },
  {
    id: "pro-05",
    level: "pro",
    prompt:
      "Let X be the score change from a hard challenge and Y be the score change from a bonus round. Two hard challenges and one bonus round change the score by 1 point. One hard challenge and one bonus round change it by 3 points. Build both equations.",
    expected: [
      { xCoefficient: 2, operator: "+", yCoefficient: 1, result: 1 },
      { xCoefficient: 1, operator: "+", yCoefficient: 1, result: 3 }
    ]
  },
  {
    id: "pro-06",
    level: "pro",
    prompt:
      "One bracelet costs X dollars and one bookmark costs Y dollars. Buying 1 bracelet and 3 bookmarks costs $7. The bracelet costs $3 more than the bookmark. Build both equations.",
    expected: [
      { xCoefficient: 1, operator: "+", yCoefficient: 3, result: 7 },
      { xCoefficient: 1, operator: "-", yCoefficient: 1, result: 3 }
    ]
  },
  {
    id: "pro-07",
    level: "pro",
    prompt:
      "Let X be the score change from one risky move and Y be the score change from one safe move. Three risky moves and one safe move change the score by 5 points. One risky move and one safe move change the score by 7 points. Build both equations.",
    expected: [
      { xCoefficient: 3, operator: "+", yCoefficient: 1, result: 5 },
      { xCoefficient: 1, operator: "+", yCoefficient: 1, result: 7 }
    ]
  },
  {
    id: "pro-08",
    level: "pro",
    prompt:
      "Let X be the distance of one forward jump and Y be the distance of one backward jump on a number line. One forward jump and 2 backward jumps together move 5 spaces. Two forward jumps and then taking away one backward jump give a move of 8 spaces. Build both equations.",
    expected: [
      { xCoefficient: 1, operator: "+", yCoefficient: 2, result: 5 },
      { xCoefficient: 2, operator: "-", yCoefficient: 1, result: 8 }
    ]
  },
  {
    id: "pro-09",
    level: "pro",
    prompt:
      "Let X be the score change for a win and Y be the score change for a penalty. Two wins and 3 penalties together change the score by 8 points. One win is worth 6 points more than one penalty. Build both equations.",
    expected: [
      { xCoefficient: 2, operator: "+", yCoefficient: 3, result: 8 },
      { xCoefficient: 1, operator: "-", yCoefficient: 1, result: 6 }
    ]
  },
  {
    id: "pro-10",
    level: "pro",
    prompt:
      "At a snack stand, one wrap costs X dollars and one smoothie costs Y dollars. Together they cost $12. The wrap costs $4 more than the smoothie. Build both equations.",
    expected: [
      { xCoefficient: 1, operator: "+", yCoefficient: 1, result: 12 },
      { xCoefficient: 1, operator: "-", yCoefficient: 1, result: 4 }
    ]
  },
  {
    id: "pro-11",
    level: "pro",
    prompt:
      "Let X be the score change from a big move and Y be the score change from a small move. One big move and 4 small moves change the score by 6 points. One big move and one small move change the score by 3 points. Build both equations.",
    expected: [
      { xCoefficient: 1, operator: "+", yCoefficient: 4, result: 6 },
      { xCoefficient: 1, operator: "+", yCoefficient: 1, result: 3 }
    ]
  },
  {
    id: "pro-12",
    level: "pro",
    prompt:
      "Let X be the number of floors an elevator goes up in one trip and Y be the number of floors it goes down in another trip. Three up-trips minus one down-trip change the floor by 5. One up-trip and one down-trip together change the floor by 7. Build both equations.",
    expected: [
      { xCoefficient: 3, operator: "-", yCoefficient: 1, result: 5 },
      { xCoefficient: 1, operator: "+", yCoefficient: 1, result: 7 }
    ]
  },
  {
    id: "pro-13",
    level: "pro",
    prompt:
      "One cinema ticket costs X dollars and one popcorn bucket costs Y dollars. Buying 2 tickets and 1 popcorn costs $9. Buying 1 ticket and 2 popcorn buckets costs $12. Build both equations.",
    expected: [
      { xCoefficient: 2, operator: "+", yCoefficient: 1, result: 9 },
      { xCoefficient: 1, operator: "+", yCoefficient: 2, result: 12 }
    ]
  },
  {
    id: "pro-14",
    level: "pro",
    prompt:
      "Let X be the score change from one strong move and Y be the score change from one weak move. Four strong moves minus one weak move change the score by 9 points. One strong move and one weak move together change the score by 6 points. Build both equations.",
    expected: [
      { xCoefficient: 4, operator: "-", yCoefficient: 1, result: 9 },
      { xCoefficient: 1, operator: "+", yCoefficient: 1, result: 6 }
    ]
  },
  {
    id: "pro-15",
    level: "pro",
    prompt:
      "Let X be the score change from one jump and Y be the score change from one slide. One jump and 2 slides together change the score by 1 point. Three jumps minus one slide change the score by 8 points. Build both equations.",
    expected: [
      { xCoefficient: 1, operator: "+", yCoefficient: 2, result: 1 },
      { xCoefficient: 3, operator: "-", yCoefficient: 1, result: 8 }
    ]
  }
];
