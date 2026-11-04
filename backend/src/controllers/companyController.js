const { CompanySetting } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

async function getOrCreate() {
  let setting = await CompanySetting.findByPk(1);
  if (!setting) {
    setting = await CompanySetting.create({ id: 1, name: 'Norbe' });
  }
  return setting;
}

exports.get = asyncHandler(async (req, res) => {
  const setting = await getOrCreate();
  res.json({ success: true, data: setting });
});

exports.update = asyncHandler(async (req, res) => {
  const setting = await getOrCreate();
  const { name, tagline, accentColor, logoUrl } = req.body;
  if (name !== undefined) setting.name = name;
  if (tagline !== undefined) setting.tagline = tagline;
  if (accentColor !== undefined) setting.accentColor = accentColor;
  if (logoUrl !== undefined) setting.logoUrl = logoUrl;
  await setting.save();
  res.json({ success: true, data: setting });
});
