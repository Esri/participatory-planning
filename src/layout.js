
module.exports = templateData => {
  const { htmlWebpackPlugin } = templateData;
  const { entry } = htmlWebpackPlugin.options;

  return (
    require("./partials/header.ejs")(templateData) +
    // require("./" + entry + "/body.ejs")(templateData) +
    require("./partials/footer.ejs")(templateData)
  );
}