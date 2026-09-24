import mongoose from 'mongoose';
import { env } from './config/env';
import { Competition, Registration, User } from './models';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const at = (ms: number) => new Date(Date.now() + ms);

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  await Promise.all([Competition.deleteMany({}), User.deleteMany({}), Registration.deleteMany({})]);
  await Promise.all([Competition.syncIndexes(), Registration.syncIndexes(), User.syncIndexes()]);

  const [aarav, diya, kabir] = await User.create([
    { name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+919800000001' },
    { name: 'Diya Patel', email: 'diya@example.com', phone: '+919800000002' },
    { name: 'Kabir Mehta', email: 'kabir@example.com', phone: '+919800000003' },
  ]);

  const judge = {
    name: 'Manju Dubey',
    title: 'Professional Kathak Dancer',
    experienceYears: 12,
    avatarUrl: 'https://picsum.photos/seed/judge-meera/200/200',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // placeholder
    videoThumbnailUrl: 'https://picsum.photos/seed/judge-video/640/360',
  };

  // Dates are RELATIVE to seed time so countdowns are always "live" whenever you run the seed.

  // 1) Main screen from the Figma: 19/20 spots left, ₹99 entry, ₹1,500 pool, submission already open
  //    while registration is still open -> Diya (unregistered) sees State A, Aarav (registered) sees State B.
  const dance = await Competition.create({
    title: 'Feedants Classical Dance',
    slug: 'feedants-classical-dance',
    shortDescription: 'Showcase your classical dance skills and win exciting rewards.',
    categories: ['dance', 'multi-win'],
    perks: ['Winners get certificate'],
    bannerUrls: ['https://picsum.photos/seed/dance-banner/1200/600'],
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    payoutVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // placeholder
    previousWinners: [
      { name: 'Riya Shah', rankLabel: '1st Winner', avatarUrl: 'https://picsum.photos/seed/w1/120/120', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { name: 'Aarav Mehta', rankLabel: '1st Winner', avatarUrl: 'https://picsum.photos/seed/w2/120/120', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { name: 'Nena Verma', rankLabel: '2nd Winner', avatarUrl: 'https://picsum.photos/seed/w3/120/120', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { name: 'Ishita Rao', rankLabel: '3rd Winner', avatarUrl: 'https://picsum.photos/seed/w4/120/120' },
    ],
    judge,
    entryFee: 99,
    prizePool: 1500,
    rewards: [
      { rank: 1, label: '1st Winner', amount: 550 },
      { rank: 2, label: '2nd Winner', amount: 300 },
      { rank: 3, label: '3rd Winner', amount: 240 },
      { rank: 4, label: '4th Winner', amount: 200 },
      { rank: 5, label: '5th Winner', amount: 130 },
      { rank: 6, label: '6th Winner', amount: 80 },
    ],
    totalSpots: 20,
    spotsFilled: 1, // = 19 spots left; matches the one real registration below
    registrationDeadline: at(1 * DAY + 6 * HOUR + 28 * 60 * 1000),
    submissionStart: at(-2 * DAY),
    submissionEnd: at(20 * DAY),
    resultDate: at(22 * DAY),
    content: {
      about:
        'This is an online classical dance competition open for all age groups. ' +
        'Participate from anywhere and showcase your talent. ' +
        'Express your passion through traditional dance. Record a 2-3 minute performance and upload it during the submission window.',
      judgingParameters: [
        { title: 'Technique', description: 'Precision of footwork, posture and hand gestures (mudras).', weightage: 30 },
        { title: 'Expression', description: 'Abhinaya, storytelling and emotional connect.', weightage: 25 },
        { title: 'Rhythm & Timing', description: 'Command over taal and synchronisation with music.', weightage: 25 },
        { title: 'Costume & Presentation', description: 'Traditional attire, framing and video quality.', weightage: 20 },
      ],
      rules: [
        'Video must be 2 to 3 minutes long, shot in a single take.',
        'Only original, unedited footage is allowed.',
        'One entry per participant.',
        "Judges' decision is final.",
      ],
      eligibility: ['Open to participants aged 16 and above.', 'Any Indian classical dance form is accepted.'],
    },
  });

  // 2) Submission NOT started yet -> registered user (Aarav) sees State C ("Registered (Starts on ...)").
  const photo = await Competition.create({
    title: 'Feedants Street Photography',
    slug: 'feedants-street-photography',
    shortDescription: 'Capture the everyday poetry of your city.',
    categories: ['photography', 'street'],
    bannerUrls: ['https://picsum.photos/seed/photo-banner/1200/600'],
    judge: { ...judge, name: 'Rohan Kulkarni', title: 'Documentary Photographer', experienceYears: 12 },
    entryFee: 149,
    prizePool: 5000,
    rewards: [
      { rank: 1, label: 'Winner', amount: 3000 },
      { rank: 2, label: '1st Runner Up', amount: 1500 },
      { rank: 3, label: '2nd Runner Up', amount: 500 },
    ],
    totalSpots: 40,
    spotsFilled: 17, // other participants are not seeded as Registration docs (demo only)
    registrationDeadline: at(2 * DAY),
    submissionStart: at(3 * DAY),
    submissionEnd: at(10 * DAY),
    resultDate: at(14 * DAY),
    content: {
      about: 'Submit your single best street photograph taken in the last 30 days.',
      judgingParameters: [
        { title: 'Composition', description: 'Framing, balance and use of light.', weightage: 40 },
        { title: 'Storytelling', description: 'Moment and narrative captured.', weightage: 40 },
        { title: 'Originality', description: 'Fresh perspective on a familiar scene.', weightage: 20 },
      ],
      rules: ['Minimal edits only.', 'No AI-generated imagery.'],
      eligibility: ['Open to everyone.'],
    },
  });

  // 3) FULL -> State D ("Registration Closed") for anyone not registered.
  await Competition.create({
    title: 'Feedants Sketch Masters',
    slug: 'feedants-sketch-masters',
    shortDescription: 'Pencil, charcoal, ink. Show us your line work.',
    categories: ['art', 'sketching'],
    bannerUrls: ['https://picsum.photos/seed/sketch-banner/1200/600'],
    judge: { ...judge, name: 'Ananya Rao', title: 'Illustrator & Art Educator', experienceYears: 9 },
    entryFee: 49,
    prizePool: 1000,
    rewards: [
      { rank: 1, label: 'Winner', amount: 600 },
      { rank: 2, label: '1st Runner Up', amount: 400 },
    ],
    totalSpots: 10,
    spotsFilled: 10,
    registrationDeadline: at(2 * DAY),
    submissionStart: at(4 * DAY),
    submissionEnd: at(8 * DAY),
    resultDate: at(12 * DAY),
    content: { about: 'A traditional-media sketching contest.', judgingParameters: [], rules: ['Traditional media only.'], eligibility: [] },
  });

  await Registration.create([
    { competitionId: dance._id, userId: aarav._id, paymentStatus: 'paid', paymentReference: 'MOCK_SEED_0001', amountPaid: 99 },
    { competitionId: photo._id, userId: aarav._id, paymentStatus: 'paid', paymentReference: 'MOCK_SEED_0002', amountPaid: 149 },
  ]);

  console.log('\nSeed complete.\n');
  console.log(`Users:  Aarav (registered in dance + photo)  ${aarav.id}`);
  console.log(`        Diya  (nothing registered)           ${diya.id}`);
  console.log(`        Kabir (nothing registered)           ${kabir.id}\n`);
  console.log(`Dance competition (Diya=A, Aarav=B): ${dance.id}`);
  console.log(`Photo competition (Aarav=C):        ${photo.id}`);
  console.log('\nTry:');
  console.log(`  curl "http://localhost:${env.PORT}/api/competitions/${dance.id}?userId=${diya.id}"`);
  console.log(`  curl -X POST http://localhost:${env.PORT}/api/competitions/${dance.id}/register -H "Content-Type: application/json" -d '{"userId":"${diya.id}"}'`);
  console.log(`  curl -X POST http://localhost:${env.PORT}/api/competitions/${dance.id}/submit -H "Content-Type: application/json" -d '{"userId":"${aarav.id}","title":"Chai at dawn","fileUrl":"https://example.com/photo.jpg"}'\n`);

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
