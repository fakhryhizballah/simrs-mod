const Users = require('../modelsMongoose/Users');
const Menus = require('../modelsMongoose/Menus');
const { head } = require('../routes');
module.exports = {
    login: (req, res) => {
        let data = {
            title: "login | SIMRS",
        };
        res.render("./auth/login", data);
    },
    dashboard: (req, res) => {
        let data = {
            title: "Dashboard | SIMRS",
        };

        res.render("./dashboard/index", data, (err, dashboardHtml) => {
            if (err) {
                console.error("Error rendering dashboard/index.ejs:", err);
                return res.status(500).send("Internal Server Error");
            }

            data.body = dashboardHtml;
            res.render("./layouts/main", data);
        });
    },
    menu: async (req, res) => {
        let findUser = await await Users.aggregate([
            {
                // 1. Cari user yang sesuai
                $match: {
                    username: req.user.username,
                    'akses': { $exists: true, $ne: {} }
                }
            },
            {
                // 2. Ubah objek 'akses' menjadi array [ {k: "penyakit", v: "true"}, ... ]
                $project: {
                    aksesArray: { $objectToArray: "$akses" }
                }
            },
            {
                // 3. Filter array tersebut, ambil yang value-nya (v) adalah "true"
                $project: {
                    aksesFiltered: {
                        $filter: {
                            input: "$aksesArray",
                            as: "item",
                            cond: { $eq: ["$$item.v", "true"] }
                        }
                    }
                }
            },
            {
                // 4. Ubah kembali array yang sudah difilter menjadi objek
                $project: {
                    _id: 0,
                    akses: { $arrayToObject: "$aksesFiltered" }
                }
            }
        ]);
        let findMenu = await Menus.find({ hak_akses: Object.keys(findUser[0].akses) });
        let data = {
            title: "Menu Utama | SIMRS",
        };
        data.dataMenu = findMenu.map(x => x.menu).join('');

        res.render("./menus/menu-grid", data, (err, menuGridHtml) => {
            if (err) {
                console.error("Error rendering menu-grid.ejs:", err);
                return res.status(500).send("Internal Server Error");
            }

            data.body = menuGridHtml;
            res.render("./layouts/main", data);
        });
    },
    inacbg_klaim: (req, res) => {
        let data = {
            title: "Dashboard | SIMRS",
            script: ["/asset/js/inacbg_klaim.js"]
        };

        res.render("./dashboard/inacbg_klaim", data, (err, dashboardHtml) => {
            if (err) {
                console.error("Error rendering dashboard/inacbg_klaim.ejs:", err);
                return res.status(500).send("Internal Server Error");
            }

            data.body = dashboardHtml;
            res.render("./layouts/main", data);
        });
    },
    inacbg_klaim_kirim: (req, res) => {
        let data = {
            title: "Dashboard | SIMRS",
            hrefhead: ["https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css", "/asset/css/diagnosa.css", "/asset/css/idrg.css"],
            script: ["/asset/js/inacbg_klaim_kirim.js", "https://code.jquery.com/jquery-3.6.0.min.js", "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js", "/asset/js/diagnosa.js", "/asset/js/idrg_klaim.js"]
        };

        res.render("./dashboard/inacbg_klaim_kirim", data, (err, dashboardHtml) => {
            if (err) {
                console.error("Error rendering dashboard/inacbg_klaim_kirim.ejs:", err);
                return res.status(500).send("Internal Server Error");
            }

            data.body = dashboardHtml;
            res.render("./layouts/main", data);
        });
    },
    diagnosa: (req, res) => {
        let data = {
            title: "Dashboard | SIMRS",
            hrefhead: ["https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css", "/asset/css/idrg.css"],
            script: ["https://code.jquery.com/jquery-3.6.0.min.js", "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js", "/asset/js/idrg_klaim.js"]
        };

        res.render("./dashboard/idrg_klaim", data, (err, dashboardHtml) => {
            if (err) {
                console.error("Error rendering dashboard/inacbg_klaim_kirim.ejs:", err);
                return res.status(500).send("Internal Server Error");
            }

            data.body = dashboardHtml;
            res.render("./layouts/main", data);
        });
    },
}