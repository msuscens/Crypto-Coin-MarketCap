
/* Javascript data gathering functions for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check


// FUNCTIONS

function selectRelevantCoinInfo(coinDataFromCoingeko) {
    // Select relevant data and return this data subset in an object
    // TODO: Add data to object as required by application UI as it is developed (Work-In-Progress)

    let myCoinData = []
    for (let coin of coinDataFromCoingeko) {
        let relevantCoinData = {
            "id": coin.id,
            "symbol": coin.symbol,
            "name": coin.name,
            "image": coin.image,
            "current_price": coin.current_price,
            "market_cap": coin.market_cap,
            "market_cap_rank": coin.market_cap_rank,
            //            "fully_diluted_valuation": 223652560191,
            //            "total_volume": 23926356003,
            //            "high_24h": 10803.3,
            //            "low_24h": 10348.4,
            //            "price_change_24h": 281.32,
            "price_change_percentage_24h": coin.price_change_percentage_24h,
            //            "market_cap_change_24h": 4126861220,
            //            "market_cap_change_percentage_24h": 2.14057,
            //            "circulating_supply": 18489912,
            //            "total_supply": 21000000,
            //            "max_supply": 21000000,
            //            "ath": 19665.39,
            //            "ath_change_percentage": -45.49947,
            //            "ath_date": "2017-12-16T00:00:00.000Z",
            //            "atl": 67.81,
            //            "atl_change_percentage": 15705.78593,
            //            "atl_date": "2013-07-06T00:00:00.000Z",
            //            "roi": null,
            "last_updated": coin.last_updated,
            /*            "sparkline_in_7d": {
                            "price": [
                                1.0007969801070102,
                                1.0011839918179017,
                                1.000311932232935,
                                1.0002594555409006,
                                1.0005916841913018,
                                1.0015855034136851,
                                1.0016548773288898,
                                0.9999688897441158,
                                1.0027264807527714,
                                1.001750559532463,
                                1.0017286318882215,
                                1.0015234970775773,
                                1.0008813255677427,
                                1.000115879159708,
                                0.9996082700196062,
                                0.9993101412063182,
                                1.001839475397031,
                                0.999882706944701,
                                1.0011332182447834,
                                1.0010970847334324,
                                0.9986048424087001,
                                1.0009011930733656,
                                1.0000727723073854,
                                1.0011628801562027,
                                1.0005185874169065,
                                1.0011070197318694,
                                1.0013802135930685,
                                1.0012942411788164,
                                0.999576461096341,
                                0.9992128890703925,
                                1.00088624054416,
                                1.002038259181483,
                                1.0011168712152365,
                                1.0011168712152365,
                                1.0005518970344,
                                1.000950254354315,
                                1.0008804087908234,
                                1.0005939159627508,
                                1.0005159128369747,
                                1.0000654925802799,
                                1.0011940675188946,
                                0.9989381708346551,
                                1.001615966300161,
                                0.9998683627287868,
                                1.001876387584139,
                                1.0016517809080099,
                                0.9992834140829213,
                                1.0006172035193452,
                                1.0003643798952366,
                                0.9996700423565278,
                                1.000265013024556,
                                1.00068583103398,
                                1.0008512515655936,
                                1.0015118832118362,
                                1.001223302704737,
                                1.0004438290585833,
                                1.0016014087153133,
                                1.0013472817716664,
                                1.0021453472304385,
                                0.9989269201079843,
                                1.0015187034374418,
                                1.0014497137627751,
                                1.0015249298170028,
                                1.0003674972261922,
                                1.0012756472259825,
                                1.0002836891383102,
                                1.0011770689115937,
                                0.9999834242129534,
                                1.0006812774083087,
                                1.00021436030347,
                                1.0001067962487906,
                                1.000682982238311,
                                1.0005622485708894,
                                1.0013280093112478,
                                1.000253530722928,
                                1.0011402057493992,
                                1.0012581661464859,
                                1.002104070832305,
                                0.9994336211245578,
                                1.0004832086814162,
                                1.000694866252483,
                                1.0003842931325522,
                                1.0003853156897777,
                                1.0017170749490514,
                                1.0002468402771068,
                                0.9989166689264602,
                                1.0005776944519702,
                                1.0005356920347794,
                                1.0009695176422826,
                                1.0010769807315585,
                                1.0003969659282939,
                                1.0003494390637715,
                                1.000320687257037,
                                1.0010296782109958,
                                1.0000975164778352,
                                1.0007368099282485,
                                1.0007698524050523,
                                1.0005439261566684,
                                0.9995098426074129,
                                1.000349050980724,
                                0.9997671845806552,
                                1.00020432273036,
                                1.0005755015888953,
                                1.0001021971306718,
                                1.000005343349148,
                                1.0003403112296236,
                                1.0004313841816637,
                                1.0001705560933933,
                                1.0002189507842676,
                                0.999554909931076,
                                1.0016685191452097,
                                0.9998393337654348,
                                1.0003419532331232,
                                1.0000242034304268,
                                1.0007096587502973,
                                1.000341551095967,
                                0.9998186741352166,
                                1.0007524610703118,
                                1.0003984890066882,
                                1.0008600501919864,
                                1.0003048882612695,
                                1.0002462600160453,
                                1.0003560458711913,
                                1.0000931825310415,
                                1.0011110843914544,
                                1.0005003891761133,
                                0.9994338419548536,
                                1.000082278104023,
                                1.000834497621122,
                                0.9991859795458253,
                                0.9993732619985589,
                                1.0005271524600505,
                                0.9997696595244193,
                                1.000961179670599,
                                1.0013823755041937,
                                1.0010883565876918,
                                1.000378817308367,
                                1.0006390085003902,
                                0.9999405675538934,
                                1.0007652107745593,
                                0.9997376315163964,
                                1.0009443482517697,
                                1.0019662818716724,
                                1.000434437618952,
                                0.9998387978682162,
                                1.0011166142847214,
                                1.0009624988207428,
                                1.0006831803927525,
                                1.00179366129089,
                                0.9992398578202829,
                                1.0020241747087804,
                                1.0012303274974443,
                                1.0016935724432543,
                                1.0012458030855305,
                                1.0025542941332,
                                1.0012393511162345,
                                1.0024616083329332,
                                0.9995555278125348,
                                1.000799303688466,
                                0.9996611355585436,
                                1.001819338251628,
                                1.000483134179161,
                                0.9999085319625948,
                                1.0007126878666253,
                                1.0007872579305652,
                                1.0012442415002776,
                                1.0005938677646542,
                                1.0005491661894341,
                                1.0003217599850722
                              ]
                            },
            */
            "price_change_percentage_24h_in_currency": coin.price_change_percentage_24h_in_currency

        }
        myCoinData.push(relevantCoinData)
    }

    return myCoinData

}


function dummyGetCoins() {
    // Function to return hardcoded test data, as an array of coin data objects
    // The returned data is in the format that a Coingeko /coins/markets API call would return.
    // TODO: This function to be later replaced by async getCoins() function, that will use 
    //       a Coingeko API call to fetch current data for all coins.
    const dummyCoinsFromCoingeko = [
        {
            "id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
            "current_price": 10647.64,
            "market_cap": 196919816977,
            "market_cap_rank": 1,
            "fully_diluted_valuation": 223652560191,
            "total_volume": 23926356003,
            "high_24h": 10803.3,
            "low_24h": 10348.4,
            "price_change_24h": 281.32,
            "price_change_percentage_24h": 2.71378,
            "market_cap_change_24h": 4126861220,
            "market_cap_change_percentage_24h": 2.14057,
            "circulating_supply": 18489912,
            "total_supply": 21000000,
            "max_supply": 21000000,
            "ath": 19665.39,
            "ath_change_percentage": -45.49947,
            "ath_date": "2017-12-16T00:00:00.000Z",
            "atl": 67.81,
            "atl_change_percentage": 15705.78593,
            "atl_date": "2013-07-06T00:00:00.000Z",
            "roi": null,
            "last_updated": "2020-09-15T08:54:19.684Z",
            "sparkline_in_7d": {
                "price": [
                    10234.620490830348,
                    10314.30886774419,
                    10277.539133529153,
                    10174.050813222339,
                    10174.565578683374,
                    10067.425876132495,
                    10058.829988081849,
                    9987.148155218716,
                    10009.670518035802,
                    10009.967337082613,
                    10110.722867663573,
                    10092.757003600336,
                    10149.074527525552,
                    10161.66993910936,
                    9978.866934296146,
                    10035.487961581819,
                    10004.316333886345,
                    10035.279584199028,
                    10113.466232225257,
                    10134.463666083357,
                    10128.6545716569,
                    10117.397546330107,
                    10009.98828445527,
                    10037.638080299837,
                    10088.181062085147,
                    10090.737350321917,
                    10105.958511451561,
                    10197.008832295123,
                    10162.09321343993,
                    10191.710510932939,
                    10170.702690631184,
                    10208.93648299731,
                    10189.631447813392,
                    10214.570526564063,
                    10245.67923470048,
                    10265.926414272724,
                    10245.9541119044,
                    10269.005865839164,
                    10331.463766805526,
                    10289.829569349205,
                    10259.80188146285,
                    10244.594756346976,
                    10278.040385404536,
                    10219.519947596742,
                    10283.490095015835,
                    10375.692688316294,
                    10365.208771645659,
                    10368.235191939546,
                    10381.711034401133,
                    10373.253604419084,
                    10327.223562286246,
                    10269.929089686935,
                    10267.96451207987,
                    10280.293017441678,
                    10269.70521962493,
                    10298.655732259145,
                    10369.14412440071,
                    10438.803899344208,
                    10394.951332745073,
                    10434.051710203013,
                    10341.554866151238,
                    10349.458222041649,
                    10287.265460975921,
                    10280.944054166901,
                    10302.911500652652,
                    10343.005803247654,
                    10350.184071739108,
                    10342.159391205681,
                    10358.895045828178,
                    10303.383961406369,
                    10271.86168888466,
                    10236.036163431876,
                    10232.189255588824,
                    10285.702846976372,
                    10274.253148780843,
                    10267.35238314892,
                    10298.670994113532,
                    10316.439331159636,
                    10292.184570797006,
                    10263.133571012864,
                    10292.982391461916,
                    10285.150814515882,
                    10301.67058683744,
                    10318.98189915247,
                    10313.47755020916,
                    10301.637837308319,
                    10323.776668132572,
                    10324.955573338131,
                    10321.892109049977,
                    10344.894473111255,
                    10374.529112258864,
                    10384.852288922826,
                    10348.615904749493,
                    10361.680457084545,
                    10340.63435651802,
                    10348.758811580838,
                    10359.480129989683,
                    10355.750206640165,
                    10332.094452485999,
                    10337.935749934542,
                    10335.135980519924,
                    10354.34446323866,
                    10341.497886397288,
                    10341.098037446456,
                    10318.436764067435,
                    10296.0706310326,
                    10349.678552384916,
                    10363.371133188532,
                    10372.319689243168,
                    10373.449074092274,
                    10454.791964896625,
                    10454.160637370904,
                    10443.118403008802,
                    10454.982314922976,
                    10431.721596427793,
                    10439.38467226404,
                    10434.07397692734,
                    10424.853484129064,
                    10440.78509992607,
                    10548.167345505997,
                    10534.924014172115,
                    10536.830155509417,
                    10527.875323335791,
                    10556.8611380696,
                    10538.72964472337,
                    10491.954541965135,
                    10460.712638412317,
                    10341.511245559685,
                    10307.557791288955,
                    10331.221248614418,
                    10337.774448384725,
                    10296.201410271684,
                    10255.053597312952,
                    10277.348502207646,
                    10265.825630500422,
                    10318.449233896787,
                    10317.019570038414,
                    10319.484829697154,
                    10322.885665256115,
                    10328.866065987393,
                    10292.991983847673,
                    10318.725266055328,
                    10350.923435905755,
                    10355.095814057653,
                    10349.032770145364,
                    10347.811315680796,
                    10362.038100752674,
                    10382.836786522263,
                    10366.31846182484,
                    10359.292059839216,
                    10415.89874375646,
                    10471.385009631873,
                    10500.065473073064,
                    10620.848965308876,
                    10641.145767278105,
                    10712.501252159314,
                    10724.30133884557,
                    10668.426498566741,
                    10664.306106125927,
                    10684.225520630813,
                    10690.620925676376,
                    10734.073851250494,
                    10660.052663645542,
                    10673.126376108872,
                    10679.272832668905,
                    10734.088372486605,
                    10771.660391464402,
                    10751.008166294745,
                    10730.042844849746
                ]
            },
            "price_change_percentage_24h_in_currency": 2.7137817251678316
        },
        {
            "id": "ethereum",
            "symbol": "eth",
            "name": "Ethereum",
            "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
            "current_price": 370.41,
            "market_cap": 41741624869,
            "market_cap_rank": 2,
            "fully_diluted_valuation": null,
            "total_volume": 13424414002,
            "high_24h": 383.86,
            "low_24h": 362.62,
            "price_change_24h": 6.15,
            "price_change_percentage_24h": 1.68698,
            "market_cap_change_24h": 340007595,
            "market_cap_change_percentage_24h": 0.82124,
            "circulating_supply": 112609862.1865,
            "total_supply": null,
            "max_supply": null,
            "ath": 1448.18,
            "ath_change_percentage": -74.21557,
            "ath_date": "2018-01-13T00:00:00.000Z",
            "atl": 0.432979,
            "atl_change_percentage": 86140.98163,
            "atl_date": "2015-10-20T00:00:00.000Z",
            "roi": {
                "times": 45.50141373717024,
                "currency": "btc",
                "percentage": 4550.141373717024
            },
            "last_updated": "2020-09-15T08:55:30.899Z",
            "sparkline_in_7d": {
                "price": [
                    344.90920421297795,
                    349.454189755185,
                    346.8947814900369,
                    344.25003796601766,
                    343.88349615265037,
                    337.9611842867399,
                    338.96368541033473,
                    334.08330947957853,
                    337.15159042522964,
                    335.1821709753419,
                    342.52678998721296,
                    341.0433164450546,
                    343.93212656084773,
                    345.04574310863006,
                    334.7680241463325,
                    335.4136401855171,
                    335.7598016209908,
                    338.2906957098846,
                    337.4872346918339,
                    337.84505193506857,
                    339.99087681211245,
                    339.05783146102283,
                    333.4169782193969,
                    332.75047406881043,
                    335.925247130404,
                    336.92029938962656,
                    337.04435640417455,
                    342.7054841421219,
                    340.7903170197913,
                    346.2740260797277,
                    345.3410029529932,
                    347.7398856439545,
                    346.88212400802803,
                    347.3771046601444,
                    350.189980644465,
                    354.28180572247635,
                    351.0978765418686,
                    351.60864288628056,
                    357.9023438293019,
                    356.5983733874058,
                    353.65695912595487,
                    353.8546474727252,
                    356.15395061858464,
                    351.2322670832359,
                    356.84005016325,
                    366.1988926176563,
                    368.51994674485564,
                    369.5357580245328,
                    373.6709881367289,
                    371.07698145349826,
                    368.26549699887715,
                    363.1929384483058,
                    364.39974312402677,
                    364.9391904394528,
                    363.9284663907683,
                    366.4703450705218,
                    373.1671837780159,
                    375.7238772784972,
                    369.5482036018675,
                    370.7341747031894,
                    367.2897954424814,
                    367.7602424357422,
                    363.94870614495596,
                    364.19884814259115,
                    366.2845684135984,
                    365.6023897279377,
                    368.1798738918276,
                    367.7879348109583,
                    370.23108463011937,
                    365.36864097244654,
                    363.35309330094566,
                    358.6622938054573,
                    358.3698676166769,
                    362.17785814265886,
                    362.8570808223086,
                    362.5606315909919,
                    365.15604812982724,
                    366.7156634549598,
                    365.40180400028805,
                    362.9222248493788,
                    365.108267376503,
                    365.61022064227615,
                    367.2850582411675,
                    369.75793339665506,
                    367.8277021453464,
                    367.3740328182264,
                    368.0723497059059,
                    368.8616010336413,
                    368.6053344508236,
                    369.3752339464473,
                    373.96574571160744,
                    373.9079622546078,
                    371.33531425613074,
                    372.1960752443509,
                    369.1219857307951,
                    369.78673368437757,
                    370.6162303960184,
                    370.8832015871703,
                    366.2735150017342,
                    368.66712527040784,
                    367.80473473663005,
                    369.817016023528,
                    368.9253204968201,
                    371.2436596199106,
                    368.4965381315217,
                    368.22653030984634,
                    372.4188467527274,
                    373.33172273547575,
                    372.8304556845132,
                    372.98290782450925,
                    383.4517397277913,
                    383.6894518989671,
                    383.52834283289155,
                    383.58516333647015,
                    384.2283260607226,
                    387.72351629002264,
                    384.21698797313536,
                    384.4927252756304,
                    385.526647293815,
                    388.7719790228847,
                    386.4450439684409,
                    387.41534641343094,
                    386.3776689082983,
                    387.4206592923921,
                    385.72430233650914,
                    382.6963973572127,
                    378.70803697332593,
                    372.97171371509944,
                    369.4310132961152,
                    368.46136474440243,
                    368.60833262283677,
                    361.5381754935108,
                    356.1704808502531,
                    359.37116419014126,
                    359.59267442541767,
                    363.55386860407754,
                    362.70205155006266,
                    364.295792263216,
                    365.15842313270133,
                    366.1003526366457,
                    358.4504457589429,
                    362.4054824797869,
                    366.13175747874783,
                    366.42443122631175,
                    364.96637580669574,
                    364.63016948956255,
                    367.14074307101987,
                    367.8974519932671,
                    364.26654341530025,
                    363.89719326702095,
                    367.09453058793855,
                    368.72820649891423,
                    369.2986753497753,
                    374.0084114573083,
                    373.7081535973415,
                    382.5323717000477,
                    380.28215034751196,
                    376.57954473309707,
                    375.5398900401946,
                    375.4779374048706,
                    376.43996209515336,
                    378.7648512273411,
                    372.2394582117436,
                    376.7815195031208,
                    375.9400672657068,
                    376.41951879683853,
                    378.61369701814954,
                    376.3750127881936,
                    375.15191751667265
                ]
            },
            "price_change_percentage_24h_in_currency": 1.6869773438620763
        },
        {
            "id": "tether",
            "symbol": "usdt",
            "name": "Tether",
            "image": "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707",
            "current_price": 1,
            "market_cap": 14722467308,
            "market_cap_rank": 3,
            "fully_diluted_valuation": null,
            "total_volume": 40406471125,
            "high_24h": 1,
            "low_24h": 0.998801,
            "price_change_24h": 0.00168378,
            "price_change_percentage_24h": 0.16858,
            "market_cap_change_24h": -19259625.88492966,
            "market_cap_change_percentage_24h": -0.13065,
            "circulating_supply": 14715332611.0702,
            "total_supply": 10166574840,
            "max_supply": null,
            "ath": 1.32,
            "ath_change_percentage": -24.38301,
            "ath_date": "2018-07-24T00:00:00.000Z",
            "atl": 0.572521,
            "atl_change_percentage": 74.75077,
            "atl_date": "2015-03-02T00:00:00.000Z",
            "roi": null,
            "last_updated": "2020-09-15T08:08:57.054Z",
            "sparkline_in_7d": {
                "price": [
                    1.0007969801070102,
                    1.0011839918179017,
                    1.000311932232935,
                    1.0002594555409006,
                    1.0005916841913018,
                    1.0015855034136851,
                    1.0016548773288898,
                    0.9999688897441158,
                    1.0027264807527714,
                    1.001750559532463,
                    1.0017286318882215,
                    1.0015234970775773,
                    1.0008813255677427,
                    1.000115879159708,
                    0.9996082700196062,
                    0.9993101412063182,
                    1.001839475397031,
                    0.999882706944701,
                    1.0011332182447834,
                    1.0010970847334324,
                    0.9986048424087001,
                    1.0009011930733656,
                    1.0000727723073854,
                    1.0011628801562027,
                    1.0005185874169065,
                    1.0011070197318694,
                    1.0013802135930685,
                    1.0012942411788164,
                    0.999576461096341,
                    0.9992128890703925,
                    1.00088624054416,
                    1.002038259181483,
                    1.0011168712152365,
                    1.0011168712152365,
                    1.0005518970344,
                    1.000950254354315,
                    1.0008804087908234,
                    1.0005939159627508,
                    1.0005159128369747,
                    1.0000654925802799,
                    1.0011940675188946,
                    0.9989381708346551,
                    1.001615966300161,
                    0.9998683627287868,
                    1.001876387584139,
                    1.0016517809080099,
                    0.9992834140829213,
                    1.0006172035193452,
                    1.0003643798952366,
                    0.9996700423565278,
                    1.000265013024556,
                    1.00068583103398,
                    1.0008512515655936,
                    1.0015118832118362,
                    1.001223302704737,
                    1.0004438290585833,
                    1.0016014087153133,
                    1.0013472817716664,
                    1.0021453472304385,
                    0.9989269201079843,
                    1.0015187034374418,
                    1.0014497137627751,
                    1.0015249298170028,
                    1.0003674972261922,
                    1.0012756472259825,
                    1.0002836891383102,
                    1.0011770689115937,
                    0.9999834242129534,
                    1.0006812774083087,
                    1.00021436030347,
                    1.0001067962487906,
                    1.000682982238311,
                    1.0005622485708894,
                    1.0013280093112478,
                    1.000253530722928,
                    1.0011402057493992,
                    1.0012581661464859,
                    1.002104070832305,
                    0.9994336211245578,
                    1.0004832086814162,
                    1.000694866252483,
                    1.0003842931325522,
                    1.0003853156897777,
                    1.0017170749490514,
                    1.0002468402771068,
                    0.9989166689264602,
                    1.0005776944519702,
                    1.0005356920347794,
                    1.0009695176422826,
                    1.0010769807315585,
                    1.0003969659282939,
                    1.0003494390637715,
                    1.000320687257037,
                    1.0010296782109958,
                    1.0000975164778352,
                    1.0007368099282485,
                    1.0007698524050523,
                    1.0005439261566684,
                    0.9995098426074129,
                    1.000349050980724,
                    0.9997671845806552,
                    1.00020432273036,
                    1.0005755015888953,
                    1.0001021971306718,
                    1.000005343349148,
                    1.0003403112296236,
                    1.0004313841816637,
                    1.0001705560933933,
                    1.0002189507842676,
                    0.999554909931076,
                    1.0016685191452097,
                    0.9998393337654348,
                    1.0003419532331232,
                    1.0000242034304268,
                    1.0007096587502973,
                    1.000341551095967,
                    0.9998186741352166,
                    1.0007524610703118,
                    1.0003984890066882,
                    1.0008600501919864,
                    1.0003048882612695,
                    1.0002462600160453,
                    1.0003560458711913,
                    1.0000931825310415,
                    1.0011110843914544,
                    1.0005003891761133,
                    0.9994338419548536,
                    1.000082278104023,
                    1.000834497621122,
                    0.9991859795458253,
                    0.9993732619985589,
                    1.0005271524600505,
                    0.9997696595244193,
                    1.000961179670599,
                    1.0013823755041937,
                    1.0010883565876918,
                    1.000378817308367,
                    1.0006390085003902,
                    0.9999405675538934,
                    1.0007652107745593,
                    0.9997376315163964,
                    1.0009443482517697,
                    1.0019662818716724,
                    1.000434437618952,
                    0.9998387978682162,
                    1.0011166142847214,
                    1.0009624988207428,
                    1.0006831803927525,
                    1.00179366129089,
                    0.9992398578202829,
                    1.0020241747087804,
                    1.0012303274974443,
                    1.0016935724432543,
                    1.0012458030855305,
                    1.0025542941332,
                    1.0012393511162345,
                    1.0024616083329332,
                    0.9995555278125348,
                    1.000799303688466,
                    0.9996611355585436,
                    1.001819338251628,
                    1.000483134179161,
                    0.9999085319625948,
                    1.0007126878666253,
                    1.0007872579305652,
                    1.0012442415002776,
                    1.0005938677646542,
                    1.0005491661894341,
                    1.0003217599850722
                ]
            },
            "price_change_percentage_24h_in_currency": 0.16858043980203663
        }
    ]

    return selectRelevantCoinInfo(dummyCoinsFromCoingeko)
}


//  TODO: Once required coin dataset confirmed, develop this function to fetch coin data via
//     CoinGeko API call(s).  Until then use dummyGetCoins() to return small hardcoded coin
//     dataset whilst developing UI (and hence refining actual data requirements)
/*
async function getCoins() {
// Fetch all the coin data via Coingeko API call and return the subset of relevant data

    // Define and Construct API URLs (for Coingeko API calls )
    const BASE_URL = "https://api.coingecko.com/api/v3"
    const COIN_MARKET_DATA_ENDPOINT = "coins/markets?vs_currency=USD&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h%2C%207d%2C%2030d%2C%201y"
    const urlCoinMarketData = BASE_URL + BITCOIN_MARKET_ENDPOINT

    // Fetch the coin data, decode into JSON format
    const callUrl = await fetch(urlCoinMarketData)
    const response = await callUrl.json()
    const data = await response;

    return selectRelevantCoinInfo( data );

}
*/