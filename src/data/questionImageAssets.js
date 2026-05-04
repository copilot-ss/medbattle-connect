const QUESTION_IMAGE_ASSETS = {
  'https://openclipart.org/image/2000px/172636': require('../../assets/images/brainrot/gamepad.png'),
  'https://upload.wikimedia.org/wikipedia/commons/0/01/Person_washing_hands.jpg': require('../../assets/images/questions/hand_washing.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/0/02/U.S._Capitol_Building_%289733883414%29.jpg': require('../../assets/images/questions/us_capitol.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/0/0a/Basking_Shark.jpg': require('../../assets/images/questions/basking_shark.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/1/12/Grand_Canyon_National_Park_GRCA9862.jpg': require('../../assets/images/questions/grand_canyon.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/3/3e/Cat_closeup.jpg': require('../../assets/images/questions/cat_closeup.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/4/4e/Desert_tent_%2815561690130%29.jpg': require('../../assets/images/questions/desert_tent.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/Firstflight_2_cropped.jpg': require('../../assets/images/questions/first_flight.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/6/6d/Fire_and_logs_at_night_%28Unsplash%29.jpg': require('../../assets/images/questions/fire_logs.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/7/79/US_Army_Lensatic_Compass_-_Flickr_-_The_Central_Intelligence_Agency.jpg': require('../../assets/images/questions/compass.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/7/7d/Lightning_NOAA.jpg': require('../../assets/images/questions/lightning.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/8/81/Ballot_Box.jpg': require('../../assets/images/questions/ballot_box.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/a/a4/Chest_X-Ray.jpg': require('../../assets/images/questions/chest_xray.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/c/c3/Greek_sigma.png': require('../../assets/images/questions/greek_sigma.png'),
  'https://upload.wikimedia.org/wikipedia/commons/c/c4/AED_Open.jpg': require('../../assets/images/questions/aed_open.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/c/cc/Nile_delta_landsat_false_color.jpg': require('../../assets/images/questions/nile_delta.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/e/e9/The_Berlin_Wall_1961_-_1989_HU99520.jpg': require('../../assets/images/questions/berlin_wall.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/e/eb/Microscope_%2815474680789%29.jpg': require('../../assets/images/questions/microscope.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Old_camera_%28Unsplash%29.jpg/1280px-Old_camera_%28Unsplash%29.jpg': require('../../assets/images/brainrot/camera.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/American_Crocodile_%2853495458717%29.jpg/1280px-American_Crocodile_%2853495458717%29.jpg': require('../../assets/images/brainrot/crocodile.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Solar_panels_%2848306990857%29.jpg/500px-Solar_panels_%2848306990857%29.jpg': require('../../assets/images/questions/solar_panels.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Toilet.JPG/1280px-Toilet.JPG': require('../../assets/images/brainrot/toilet.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Cup_Coffee.jpg/1280px-Cup_Coffee.jpg': require('../../assets/images/brainrot/coffee.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Drumstick_pair.jpg/960px-Drumstick_pair.jpg': require('../../assets/images/questions/drumsticks.jpg'),
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Keyboard_Close_Up.jpg/960px-Keyboard_Close_Up.jpg': require('../../assets/images/questions/keyboard_close_up.jpg'),
  'https://www.publicdomainpictures.net/pictures/20000/velka/capybara.jpg': require('../../assets/images/brainrot/capybara.jpg'),
};

export function getQuestionImageAsset(imageUrl) {
  if (typeof imageUrl !== 'string') {
    return null;
  }
  const normalized = imageUrl.trim();
  return normalized ? QUESTION_IMAGE_ASSETS[normalized] ?? null : null;
}
