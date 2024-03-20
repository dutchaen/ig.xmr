use std::time::{Duration, SystemTime};

use actix_session::Session;
use rand::distributions::{Alphanumeric, DistString};
use sha2::{Digest, Sha256, Sha512};

use crate::{
    models::{BaseUser, IMedia, IProfilePhoto, UserModel},
    Manager,
};
use regex::Regex;

const USERNAME_CHARSET: &str = "abcdefghijklmnopqrstuvwxyz1234567890_.";
pub const DEFAULT_PROFILE_PHOTO: &str = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVQAAAFUCAIAAAD08FPiAAAgAElEQVR4Ae19CW/iStP1/f9/7dVz76ckYHmVFywbg1iMwEuw/Sk5MzU13nAIEMBljTLlpm13n67Ta3X1P5Vc94dA+XkVn1dZlkhgURT553V8P1ZVReGQi6I4vh8RYb/fr1ar4PNy2aUPuLzPazab+b4fBEEYhvPP68AuJI8nEkk9vh/pH0K+8xfvv7/CeZ4U/fM8WXnenOz3+yzLkL80TeM43mw2cRyD3vhrsIs4rv19UXhTwNOmaVqWZX9ejuMo7FI/L03TdF03DAMxLctKPq8sy/I8P74fi6JAZVSW5XeYXxSFkP/aGi3kvzbCF3j/fr/fbDZRFPm+bxiGrusgIRc4IRVFmf59gcVNzjdDWB3ywXBcCKTIVFP8/t10HMd1Xc/zZrMZKiOe7fMqAiE/x/AaspD/Gqhe4J0OuxRF0TSN09s0TdQCREgu8Paeh/fL/Cku16qD1oqAB/Kqwfq8zusCCPkvoEa9rxDy98Jz0R/Lssyy7HA40FvRmS+KYr/fr9dr13UNw1AURVVVTj/InLqckE2Zx/yqzL/Ln21+pScED1L3BDHRTVgsFpvNJkkSzFwQFFwA7flf/qvIl0JAyH8pJAe9B/NhZVnmeY7OvG3bmqa9vb1NJpPpdNpK+6chP9UCGCbM5/PNZpPnOWGHAYLQngC5qiDkvyq8v14Oth8Oh+12u1qtbNvWdZ2m0KiFBMl5+HntMG+xvyqf98VaL6Cn5TdNE3lXFOV///vf29ubaZqz2Wy1Wu33eyxYYOJQuv3XVk0h/7UR/vX+KIqCIHBd1zRNTdPA8J6/nISQOY1rZKvd8phflfl3+bO1T/Tf4kGq1BDZND/mBWezmed5hmGgj0OfmE6ntm1HUbTdbg+HQ5ZltHZwoxIa32eE/N8tc7TqeZ7zaS28dLPZYH6+RhXSeEzXc76dlPmztde23vL435FbX94TyL/Fo/FwLlMcBFqW5ft+FEVYOCQThp6Zgu8W5PieF/JfrMxhhFNV1W638zxPURRS6JrAlf4k22sR+LO117be8vjfkVtf3hPIv8Wj8XAuUxxavzRNE+Mj3/f5LOnFCmz0LxLyX0AFiqJI03Sz2SwWC8dxLMsiDSad5gJX+hq3T97yZ/k7u2Qe/zty1/u7wvm3eBwezmWKA/MhTA1omkaDhSAIdrtdmqYyHXgBlf18hZD/Akhut9v5fG5Z1nQ6tSzLMAxwGMZwpNYkcKU/yfZaBP4svbBH4PG/I/d8ovUn/i0egYdzmeKgwbcsS1VVWgGBjQNmB4MgWCwWZPJ4gfIb6yuE/H0l3zPhvN/vF4uF67qWZXWZ3JBC9wicAF+Ve15LP331nV3x6YXXFqjlx4e60mPbdhiGu92OrxT2laX81kBAyN+AhAU0yV8UxW63Wy6XoH2XaiJ8CE/639D/67Xfz78+5FvXiMPTwGVMqaAKiKIIE4FpmqL0YE/FSlLEFgSE/C2g1ILKsjy+H7Msw2652WyGESnXxVZ5CBlaHxwYeO3382QM+dY14vA0kIy1UmxYMAwDFbHv+0mS0OrA8f3INz7WylRuq6oS8p9Wg6IoYJ8DS/Wefj5pJ4QhZKg98qXba7+fJ2bIt64Rh6eBZE5+RVH+/fdfRVF0XbcsC8ZCpwtVYgj5u3QAdrhVVWEyz3EcDOx79JtUk1bveYjIt0HANE3XdReLxeFwwOKrdAG6lFxa/g9k0LHHXvSqqrIsK8tyv9+7rgvak+IK+QmKuxWwNIAtxhgIJElChdvFhBGGC/l/FTpaiTRN4bHG8zxN02jFnuztu1bvahtsaanvbhny9AnDXIBhGJ7nJUmSZZnwv1bBCfn/AFKW5Wq1cl2XjPPgFQN7bMkWvavx53QS8nM0fkRGfW0YBnwTbbdb4f8fXf+UhPy/AInjOIoibLyhQfuXDGy4igv5ORr3IJum6Xneer3GciB2ZIx8OmDU5MdSUJZl2G8H47wu5tMeNahys/3nKi7k52jciYy5AM/zXNelKgDOAmtN4khuR03+PM/DMLQsC5tMa3vsa82+kP9OOPzNZBiGYdu2ZVm0ZXC0/B81+Q3DcD4vbC+n3fVN2jdbcmn5v0nCn3ocswCu66IKSJKE3AeNpMGnbI6F/HAOgWzv9/swDGn7TRfVm+FcX4X8HI3HleFHKI7jEXoKGAv5Qfs8z1erFRxs0Opdk+RdIVzFhfwcjYeWMRcwm83GtlNwFOSnXR9RFIHYPX4yu5gvY/6HZvjJxBuG4fs+/AiOxCJgFOTPsmw+n2Ov6H///ff29gZbnZ6J/dYqgCuQtPwcjeeQVVV1XXe73dLuQBoeP6XwtOSnbd6bzaZ57Aya8VaG9wRyFRfyczSeSYZRYJZlaZo+dxfgaclfVVWaplEUwTiftuVATXsY3vMTV3EhP0fj+WRFUVarFaqAZ90a/LTkP74foyjC0n1ry99D8q6fuIoL+TkazyfDj5ht2/Aj/pT8f3jyd3XMYJ8Poz1M54KuUNMueveHcxUX8nM0nkyGAYjneagC1us1Nno+2cj/sckPN1vcQjtJksViMZvNuDpyovJwkQWBLgR4M+B5XhiGz+c+/LHJX6uJcYg1jsThK3NC/i4Vl/AuBEB+rAphnci27SezBXgS8uPcS4zwcTK9kL9LrSV8CAK85efx5/P509gCPQP50dXHITmqqvKigiwtfxMTCelHgJNfVVU4C8VE0tPw/1HJT2djrVYrjPBRPK2bc/qLWX4VBHoQgLNQqgtgG4pNgWRLUht+PsrtQ5IfM/x5ni+XS8uyNE1DV5/zn0qL9/97ylh+EgS6EOC6BBlVwGKxeGj+PyT5889rtVrRzrzWBp/KrKtQJVwQGIIAKVJNsCzrofn/kOSvqmq5XIL5NJ7vMdQfUsASRxDoQqDGeX770Px/JPLD6UKapryQiPzwn0sFw+OILAhcCQEMKh3HieM4z/Pi82qe8nafswAPRv7dbocz26kshfwEhQg/hYCmaa7rgv8P5BTkYcifpulut/M87/X1lZdxjfz8J5EFgZshgO3A4P99tvPNVD0M+R3HgQ1PrTiF/DVA5PZHEMDhDmj/mzS7z5AHIH+apkEQYHqvWa6c/EPk5hskRBC4LALL5TJNUzru8T6Z/wCn9PYzv+fwrK6K4LLFLG8TBJoImKZJ/L9b5t87+U8yX8jf1DwJ+XEEFEUh/gv5z0Sgp7dPBdzVwneF04MiCAJXQgCWpuD/map/k8fudMyfZVkURTgk90olJK8VBG6AwHw+T5LkPsf/90h+Yf4NlFI+cRsEDMMg/t+kOf/CR+6O/ML82yilfOU2CNAu4CRJvsDLm0S9O/JLb/82SilfuQ0CGP+j/b8Jo7/wkbsgP85IKIpiuVw6jgMr/duUjXxFELgqAnziebFY3JUXoLsgf1VVx/fjcrmEd/2rFoa8XBC4JQKc/LZt3xX/74L8aPPhJvmWBSPfEgSujQAnv2EYd8X/uyA/2nxVVWHAf+3ykPcLAjdDoEZ+4v8XhuZXi/rD5MeZ2TcrCfmQIHBjBDj5+aeXy+WPuwD7SfKD+bX9+RwgkQWBR0egi/y2bf84/3+M/MR8mdt/dP2W9Pcg0EV+Xdd/nP8/Rv7VamXbtmEYYsPbozry06Mj0EN+4v/VBvUnXnxT8pdlCT9nVVW5rkuH5z56AUv6BYEuBDj5uYz4hmG4rltVVVEUt/f/dVPyY4YjTdPZbCbM71IXCX8mBDjhazLx3/d92LndmP83JX9RFGmazudzTdPEnueZVFzy0oVAjfC1WzylaVoURWmadp03f6L7fu7PNyV/VVWz2UzTNMuyZJ6vS10k/JkQqLG9eUv8933/XBaf+dxNyR/HMSb50Ow3gZAa4Zn0XvIyEAFVVafTqW3b2+32TB6f9djtyI8OPw31W5kv5B+oLhLtmRDAzj/LsoIgOBwOZxH5nIduR/75fE7NPkqulf/PVKiSF0HgJAI4/1vTNPinjqLoZvy/EfnTNEWbT/N8rcyXlv+krkiE50OAzqH577//cPj3bfh/dfKXZbnb7bC210V4Hv58RSs5EgSGI/D29mZZ1mazOacf/8Vnrk5+Yn7PJJ+Qf7hySMznRmA6nSqK4nnebrf7Ipe/HP3q5Of2PJzkXfJzF63kThDoR0BVVYz/gyC49rL/1clP0/sDD9joh0Z+FQSeGAEcMK/rumVZtm1fu/G/CvmLokiSZLfbTSYT5IdyRSUnLT9BIYIgUEMAjb+qqvv9/su9+cEPXIX8OKXQcRzOfE3TeA6F/BwNkQWBJgKTyWQ2m2Hmv2TXYHafiHgt8sdxrCiKkL9ZohIiCAxEAMd+z2azLMsY98sTnB7881XIX5YlrPdr/Od5lpafoyGyINCKwOvrq6Zpm83mAch/fD9mWUbZaA716SchP0EhgiDQigDnSJIkxP/BTfuJiBdr+ek0gvl83pqTWiDPGJdr0eRWEBgtApwX6/U6z3Pw/wSnB/98MfLDDwHMeIeUFs8Yl4c8K3EEgTEgwHnhOA41/oPZfSLixchfVVWe58NP2uMZ4/IYClXyKAgMQYDzwjAMavxPcHrwzxcjf5Zli8VCTtobUqg/EgfzLzAgo1UYqBcsr2nPFf1KdllIMA//kSyM7aM18juOs1qt4PBrMMH7Il6M/ML8e1DNmrq03lrssm3bsiwiP+28RCBtxxDy/0jhNosP/L+U2e/FyC9t/o/oR/Oj2B+OJWK01WjATdNcfF5Ldq1Wq+VyuVgsot+Xyy44mVDZRS9sfpdCSGUpRITzECAkuYDBf1+DPvi3i5FftuKfV8ADn6rZR/Y/9cnxX39aNaEsS/iKLj4vPodM60llWa7YRX3+/pRwNe1PpPx6EgEOJpdXqxUa/7L8lsHPt8hPSgMnJKQfJ3MlEb6EAPhGTbqiKJPJRNf1f//9dzqdWpYVhuFms0mSpJXqJwM54Xsiw/nybrdzHAdGXDhwRVGUt7e3l5cXwzBoHxdX1u/IXwLqySJ34WaaZlVVqMEHll1rsX6L/Kh+VquVruvE/P6W4cmK5wbZsSzLdV3btlVVxUYpGqUvFov9fl+r/mu3raV+diAULs/z/X6/2WxWqxUUFLvQUCPQTEGX7n4p/AYI3+0nuoByHCeKIqyv/Rj5oUO2bU+nUyH/lXTINE0MwzE5ZxhGEAT7/b55wAP68EVRUI/sbJLXHiQNq4Wj9t/tdkEQmKaJeZ/Ltv9XQvUhXttDftM0awb/Z1T632r5q6rCwn6PDf9DoHzniVQUBa7d4jhO07R5tHPPGL5G17Nv0zQl9SKB3oZN3PP5nPjfpbi0fNgVoRZ+50Vz1eTVoKBby7Icx8E5X1QvNwuFSqdL+Bb54zj2PA8D/quiMIaXo+tEjhxM00SuZ7PZdrtNkoSadCpvXqgUeIYS8Pf0yK1v5t+lrkdRFJ7n6br++nlhIKBpmqqqQv7hykxsbwqmaVqWtV6vMfhHKfSUXetP3yI/mE8pG54ridmFAM5vwHzebDZbr9eHw6G5rtssbE7C1pK+UiD/LpfTNF2v10EQWJb1+vqKgSHNVpDOnBS6gBpDeCs4yDjGVkEQYPTX1IchxX0++dfrNRJHEzxjKI+r5hFzpZg8A+27CrUZzok3pOAvFYd/l8vUC9jtdp7nYV3gjLWAqwJ+5y/vIb+u62j8cchPUx+GlO/55McJHEgf+nJ3DuVdJa91rDSZTBzH2W63xJyuQm2Gc+INKfhLxeHfbaaKvoJJwa/2+UduPNJP/mbjT2gPFM4hf57nh8OhVX3vimB3mxjUm5qmTadTVVVhbquqKnGeBE6tgSV6t9GKotjtdoZhfKnzf7eFeIOEtZKfKkT8qmkaJoOO78evasuXyY8POI5j27Ys752hAVSimACzbVvX9dlshhOaifYQvlqcd8t8nrAoioZXAWcg/DSPkKrUBN6Bsm07CIKqqmorfxzwLvkc8h8OB1VVhfznKRnVmOi2eZ4HD415njfn85+P/Ji8zPPcdd0hXYDzQH6Op2qcb72Fm1zYen1VW75M/jzPHcehFT5S5eeA+3q5oN6aruvo7Zumadt2VVVo5PmaDS9Fkrvq78cKz/McfZyqqubz+Un+X69E7v/NrWyvBZJtZU1/hmjFafJD+ehdq9UK1qZEewj3D+XPphDtPErOcZz5fL7f77vW8J6M8KQ8NQVNkmS73XqepygK78rW9PtLtz9byrf/OoGzWCw4vBzzLvnL5A/D0HEc0zSF/MNLGnN7aPB1XY/juGsTDtG+Vud2ld/DhVMGi6LIPi/sFMDcB6ny2cLwQnmOmFgeNgzD8zxy8tdqjtVUldPkR3WCJ7fbLZp9AMf5/xxQXikXMN1RVdVxHN/3B5ZNs7SeIITID5NkmtfcbDYX4f+VSvA+X0udbtSV3OBviKp8gfzH92MURbZtk+WpkH+4TqBuXq/XMNQ9vh9phm9IOT1NnK4eTVEUTf6fMRYYXiJPEJMICKA8zyMn2kMU5gvk3+/3sCvic1dPgOD1svDvv/+qqmoYxnQ6DcNwu91SxwwtHtZmh5TTSOLkeb5er03ThPeg2vbwIWOB65Xmfb6ZQ+R5XhzHw1VlKPmLosC+fSqA+8TirlKFHfiGYSwWCzCfpmRqq3rDC2wMMaMoIv7zAiXd6xF4/DHInPyO4ywWi+GN/yDyV1UFC+0a6GMA9zt5xK6H+Xyef17gLY11+eh3DJQensc0TYn/HP+a+rXe8vhjky3L+lLjP5T8y+USWI8N0O/kdzqdRlHEx/bEfGn5e+oC+AsD/wn/Vqo3Ayn+CAX784LK9cBLPw0lP9xIjRDQ87KM89Xn8zmm9wA3b+pJppIQoYZAURSHw4EcFtbanibtaxHOK7iHfgqeVGAzOmRFaRD5syzDlszakQ8PjdT1Ej+c+UNKqEaJsd0uFgvLsvjIFgUn5G8qMEx9LcvabrdDVGsQ+bETwzRNOJDkCwzNFIw85EvMH1JCY2N7Lb9YArQsCw5OSLuE/AQFCdQ9XywWQ1RrEPlR9ZqmyY+CaFbGlIgxC4ZhNHv7tRE+9fmHlFCNDCO8LYpisVjABLhVtXhF0BphJIGWZcFRWhiGQ1TrBPnLslyv1/DMjQ38ePtI0ByYTcdxXl5e4MUURvvcuRKnelMeIZnPyHKe54vFgjwg0PBzYAGNJBpZ3xmGsdvtTvL/BPmTJPF9fyTYnZ1NRVEw1+K6Lneq3aR6M+QMJozzkTzPgyAA/8VbdKuu8h5QFEUnF/xPkB+O+lq/JIGEANbzTdNMkoTc6Td53hoyTiafl+v9fk/8p4knGX6SHnLy27a92+36ce4kf1mW0uwTrP0C9G+73VJd28rz1sD+4pFfOQJFURD/hfxNneTkNwzjZOPfSX60YI7jyGk8TZRrITg4GX6USFlPjrgopgjDETi+H5fLpRwPV9NA3HLyw1EygOWtDoe6k/xZlsVxDBNrqWVbsabA1WpVYz6HWOQLIoAO6XK5FJ0k9SOBkx+nv6Dn/2Xyw12XOO0gZLsEx3GI+dLaX5DntVeVZXl8P2If5PH9SC4ku8plhOGc/HAeEQRBbZmZo9rZ8qdpOp1OsXggtWxTk2hZZbVagfNUv3J8Rb4UAmVZ5p8XXkiNf7NoRhvCya8oCs5KSZKENLPWOHWSPwxDTdOE/F2a5LquqqrfPyzxUtwYw3vI0ykyC8NTrvEj9zTBodA0Db49a40/15NO8juOA/cgMrnSyn/n8+KOk1C/cnBFvioCcP7JNV7Iz9EAf23b5j1/XiKd5G9t9mVNlSoCLKU0Lfk4uCJfFYE8z5fLJR0VCb2nAhqhwJlPaBiGMYj8fEjQ2uwL+UmlYNIDr/tdY6qrqr68HD5mhPykk03yoysE8nNPvFCev1p+Iv9qtaKag8/2CfkBNGyngSavVglAYeZtEEC1y/lPTBih0Ep+dFFRHLVzIlrIf3w/BkGAOqPGfCE/uUklb3y82Rfy34bz+Aoh7/s+6f0IOU9ZJhBqguu6eZ6faPmBKU7gFfITpjWBtkyR8nHhlto/8m8R7IfDgbZX1AprVLc1ztOtoiitXn3/avmhTNvtFo4Tms3+yFt+oOl5XlezLy3/LesjIn9Zlmj8yfhiVJynzBLba8J///1H1ii8gFrIH4Yh7Zdu8p++NEIBzhKyLKudhc61kIMr8m0QyD8vVVXhbG6Emoks1zhPt6ZphmHYLIs6+XF2spC/VYEsywqC4Ph+rE3yCfmbinXLkKIoju9H3/eF/ER4Lpim6TgOzflT0dTJH8expmlC/i7yk68OTnguE7Ii3BKBPM8PhwNO+2stuzEEcsJzGQ74mr596uRfLBavr6+1bby88z8GELvy6Pt+VVVpmsqY/5bEHvKtw+FQVdXIvU5xwnPZsqz/9//+33K5rM1J1cnvuu7b58UJz+UuYjxfOHKNQ+MURSFHPU2rPmn5h/DzNnFwRBp8KI/N2pcTnsvwfWzbdq0I/iL/8f0I7x01F93jJD+qM+Xz0jQNo33UnZztNbmGr9zeGAHHceDhb4Qz/5zwXLYsS1EUwzCSJOHF8Rf5D4cDJrThqJdznuTna+H7c6SqKpp9GjLV2F675eCKfHsEttsttqIJ+Yn/dOJOzZ//X+TfbrfoKZGnBOI8Cf1Ueb5fMfcZBEH/UJ+qgNuru3yRI5Akied5hmEI+Tn5YaEThiG38P2L/PA/De9fxPaa8Hz07s+Rpmn//fffYrHgGiby3SJwfD/GcTyZTNDR7S/cJ/uV2F4TqB50XZe8S1dV9Rf5QfuePv84Lfym02mrdeTdEmDMCSuKIssywzBUVZUJP9QC4DW8+sHIHxpSJz/hVWvw6fbJKsuT2TEMA+4Qxsyoh8u753mY8D9Zvs8Uodbg81vsfdB1nbzLf7T8GANgEpuYX/PeQ8wfYctvGEYQBA+n/SNPcBRFGMM+E7dP5oWzvSZT48+dzf6DMUBRFFQ3nPzGqCK8vr7GcYz6kmb1asYSI2favWUfw/63tzca645EY2uEb731fZ+Wq//BGOD4fiSPCCNBang20zTN85wzX8h/b4Tn6SmKIkkSXdeF/E3++76Pzn5RFC3kxwPDufHcMdHnh99Yzn+ubSLfGwJFUcxmMyF/k/yz2ewP+SEd34/wUUOxn5vSQ3KHCQ7yz1vbxntv6i7pqSGwWCxw5Ax5oxxS6A8dh8jbI3ie94f82KMSxzGWRnoew08Pjc7AxIP2mqYpioJhkbT8NWrd/22SJJz8fDJ7oBo8XLST5DUMw3Gc+XxeVdXx/fhrqW+9XtNeiP5XPBwi5yUYaNi2jeF9cwP//Wv/yFN4fD+6rouFqjEwv9Zz72Kxbdt/yA/lDsOwK3Yt/DwuPdZT2OBgmmYURegZCfkfsSrBqVPT6VRRlMfSwPNSW6Nq661lWX/IjwEAjvVqjV0LPC9Zj/UUziY2TXO73XZt3X9EMowtzYvFAqZ+Qn5isWmaf5E/yzJN02zbphg9wmPR+OzUottPm3nGRpvnyC8WsHVdxybfs5XhmR7EfBase/4py3K328Hut4fz9NMzAdGVF1VV8ZOQ/6FrgeP7EXqLrZldxT2qcJB/v9//2tgzfLZvJBMnAEjXdZD/oQkw5sQL+Zv1GmwfttttWZYfs/1xHCMSNe89QvN1zxci5H+OKkPI3+Qmtjxst9s0TT/IHwQBdvLwqF3853GeWNY0DfMiz0GDceaiKIooigzDkDE/URUNG+xWf5Efy6EUo2fNkMd5YlnI/wT1hZC/yVAw/S/yS8vPYYI7E2n5H53/ZVmi5ZcJP1LvlpZfyE/ooNcjLf+jMx8GGkJ+rthE8yAIPib8yrLE8J5muRB75GN+XddxDsQTcGC0WSjL8nA46LouLT9VAWTF/7GltygKuDoV8hNAEIT8j15rCPlrKo2WH547Pjb2wArKsiwhfw2p2gkHj86EcaY/SRJySFsr39Hegvx5nv8iP21+JETG3O1HPSjkf4L6Ik1TIT+RGgKo/UH+1WplWZaQnwME814x73sC8mdZBt2udWx5cY9KhpGuYRibzeYX+WkakIAYc8uPTWBC/icgf57nQn4iNa1k/SE/TjWvVY1Cfu7h/AloMM4sgPwy20/8x3b1v8gvFn6EDnaA1o43GCdzniDXQn6u2PBoDId9H91+cnVUizTmW3T7peV/AvLj6C6x7Sc608bcIAh+kZ92sFOkMQtC/iegPbIg5K8RGcN5XdcdxxHy18D5uEVVKC3/E1QBWOqTlp9rOTX+v8g/EidnHIIeWcj/BLRHFkB+mfDj2k6N/z88VGQggIWP5XL5NBwYbUbW67UY+dR4DXN+0zSF/DVkPm6F/E9TWYD8VKYthT3KIBzaK+RvKXwMiqTlf4IqYL1ew5S9ZsbSUupjChLyd5a2kP8JaI8soOVHz7+zvEf5g3T724sdHk4ty3oaDowzI2VZoijHdlxvu1r/HWoYhnT7/4bk847Ij7PMxsmcJ8h1URQw7Bfy17QcE/5C/hosH7eWZRmGYVmWkP+hqwA6sUfIX9NyIX8NkD+3Qv6H5jwlXsj/R6f/loT8f+PB7jA/bJrmer0mTRLh4RBYLpeYuyWbNlbIoxb/kF+gqSkCoDFN0/f9h9N4STAhMJvNhPw13cZtC/llLZSQosafNEmEh0MAKi5tG2k1CX/IT9MhQv4aOqZpPpzGS4IJASE/6XNN+EV+z/MwvwV/HvS3FnuEt2gxcJI56ZMIj4IAfNJDy0eovf1Zhnn/P57n2bZNmx+E/IQayL/dbh9F3SWdOKUHOGy3W2E+KXNN+EX+2Wwm5K9Bw28dxymKoqoq6QI8ROWCYiqKAmdRy4CfKzMceOLvh3mv7/uAidp8CLVnRns7mUzg1SPP84fQ/pEnkgprMpkI85u0RR//V8sfBIGiKJjzkwm/Jlimae52O7T8YvB3/zVLnudlWeZ5Ln3+pjKjzYcDz/l8/k8YhkL+VpgQaJom9vYWRSHkv3/yF0WRpulqteop05Wa4LQAACAASURBVDH/ZBiGoiiGYXyQfz6fg/zSR2rVCcuyPM/L81zIf//MRwr3+71hGOKTtlWfyW//H/JLH6kVKdrks9vtys/rUQgw2nSmabrb7RRFmUwmXWU65nCQX9O0D/IfDgeMAcD/k3/HBpxt26qqep53fD9Kt/8h6pTFYiHk7+IpyK+qapZlv8iPmYCTzB/h0MC2bQyL9vu9kP/+yZ8kyWw2U1VVHFK38h/kVxTlF/kxyQ9r9pP8b33jEwei5VdVdblcCvnvn/zkrlfG/K2shHeTPy0/Ip2kPSK0vvGJAy3LUj+vIAiE/PdP/jAMsW4t5G9lJdnyfrT8ZVkOpP04yY+aEsOiOI6F/3fLf1hheZ5H+t2q/SMPpJF7VVUf5EeHf+Cwf2zYASxUfFEUpWl6t9o/2oTB/rqqquVy2Xre/NiU9mR+DcP4RX7LsgYO+KnaOPn2p4nAu0WWZcVxPFqO3XPGi6JIkgRqLPbpPewDhbFX/aPlF/L3g8X5j8ZfOv/3VhEURYEOvxzO06PM6N3ruv6L/LzK5FreJfe/+vl+5Thg+2P2ed2b9o88PZvNBqXzfBp42RxhNnS/3390+4X8/eBy8uOQo9VqdTgcRk62u8p+mqY0yd9fmvJrnfxZljmOM3DYPzb4OPl1Xbc/Lxn53xX5pdkfzkrLsnRd/9Py53nuuq6QvxVBTn5N0xzHURRltVpB+8XDxz3UAtLst6pua+Bf5D++H4/vR5osoQe40nOZIoxE4HnXNA29Jl3XN5tNVVVJktyD9o82DWVZ7na7pvaORDnPyKZlWa7rwt/ZP8f3Y1EU5OGcXseVnssUYSRCV97n83me52ma0iLzaBn4gxnPsmyxWMhU33AymqYZBEFVVUVRfJC/qqogCKhNw4u40nN5+GeeI2ZX3k3TROMv7r1+kPy73U6Y/yWiaZq2WCz+tPxlWQr5uxDsIr+u6+g+ic3fT5EfzT4KqKv4JLyGAHz4oMg+lvpgsoKZAIrKlZ7LFGEkAs87l2EpEYbh4XCQab/b8z9JEunwn8HByWRCY9UP8mPUKuRvhZITviYT/7MsE5u/W/K/LEthfqu6ngw0TZMo/4f82BFBD9cUnW4pwkgEynirAP7vdjtp/G9J/iRJZKh/HgFptu+XhR9afiF/K5qtnOeBuq7P53Np/G9GfjT7I9xj1qqfXw3EbB8o/7GxB11WbOynd3H95jJFGInA894lq6oahiGOi7gZB8b5oeP7MYoiOWDibPbBMgWU/0V+VAG8Nu1S9LO/+qAPduHAw6fTqWEYy+VS1vyvXSWt12vTNMUz79ls4uNTIf8JGDnJu+TpdArLX6z8X5sAo31/HMeu66qqKuQ/obXdP/OzTNvJj0O7W3W9+7XP+UsrCDxQ0zRVVTVNsyxrNpuNlpk3yLjv++R8Vnr+w/nG7fd4Mf1FfhpNua7L9ZvLwz85kpg1LZzP52L2wzXsInKWZVEUwZmqoijiq+dL5HJdFz5OMNtHJfIX+dfrta7rqqrS8cac9pC/9NURRjZNU/hP6nURocn8EerVd7LsOA58GdeGpX+R/3A4mKaJEWyT9kL+gQUg/L8I5/ESYf5AreuJpmnadDq1LKvmhOYv8ud5btv2ZDLBOZ6t/O/5hvxECID/F+TAaF9FvX20SYSwCMMRUBTl7e3Ntu3aJrS/yF+WZRiG//d//4dOgpB/OL6tMReLhSz+n1FtYdKkKIrlcsmVsBVkCRyCwMvLy3w+rxmh/0X+qqrW6/XLywtex3EneciXJA4QsCxL+H8G+auqOr4fl8tlzbuU6NV5CGCJZLPZnCB/lmXk35cIz4XzPj/ap4T/Z5AfbT7m9kX3vs8deO9pdkLrLX9VVVjn6zrA5/tJGdsbwP8zOPDcj5RlSdvJazlFm99cdRqb5lwqv5Zlzedzbt4DwP8iP6xTN5vNy8sLr3G5fKkEje09hmHI+j8neVmWcCGHQMxF7fd7rOHT37HpyTXyO51Od7vdCfLD7jdJEk3TOOG5fI3EjeGdpml6nocy4BwYrdxs+TebjeM4RHux5LkULyzLQp+/tvfkr5afjP7hDpU4z+ddLpWgsb3Htm1VVT3PS9O0Nu8yWv4j4+gC7Pd7x3EmkwmdsSvkvxRHsIcfTju5srWQvyzLKIpQBuC/kP+bxQATYNu2gWQURfv9XqoAKOLx/YjOJvqbMESl9v+byI/5cSzY67q+XC4BdV/LT79h6IWHcUYV5z/f+TtmcL+Ud74FYDqdmqa5WCxqRhcYlZGHBV5JP5OcZRn6mGmabjab2WzGd558CVWJ3IWApmmKory8vCiKQoZ9tfbmr5af1A6mftBXIX8XvueFq6qqKIqqqpZl+b5/OBwAe+3vM7G9NS95ngdBgEE+ADkPT3mqFQGY9E6n06ZhHxVHnfzU+EdRhPqYtvfiGxgItH5PAocggC3Aqqqapuk4ju/7cRznnxfnP5XQkwnU5tPQUvm8eM9oCIwSpx8BkF/XdTpartbsf/jw4wpHclVV2+3W8zxiPnX1hfz9oJ/8tUZ+TdNc112v10mSEP7NcnqaKiDLsvl8bpqmZVnoVGIq5CRuEuFLCMDHRP8CUzv5oXwoIZo2+NK3JXIXArVJbFSm+LtareAImPpfj855zOTneZ5lGTztt8IiY/5WWL4TCNdyiqJAhahd4RrVR/75fG5ZlvTHvlMGzWdr5OcRsPVqtVo1JwJ5md2/DFWjdOZ5vl6vXdcVXeLFfVVZURSYlqAh+TL5D4eDYRimadK6ixTe9QoMUwBk0I6BAPHnsQQ0+FmWHQ6H/X4fBIFt25jVQ3dUFOl6ioQ3a5pm2/Zut8vznJhfG072tfxlWcIvnZD/2kWF94MYqHAdxwnDcL1e35tRUK1V76qVju/HzWZj2/bb25voz230h3/FMAzP86qqOpP8VVXN53MZ83NMryfXGkM+FxBFURzHdzIR0DTLBf+RvCzL4jheLBZBEHieJ5N511OY/jdPJhPYkh/fj+e0/Jjzr53h1/9J+fXiCMDuzfM8VAF5nmM/DE5cq3XkutrhC4bXNuQQ8zGwD8PQcRzXdcmc8eKAyAuHIED2/Jz5NW3p6/ajz+D7/pCPSZxrI4COnKIoQRDwvdkD++EX5H9RFHmep2kK07E0TcMwhA0oNwkjQ91rIyPvbyJA9vzcbPQL5C/LMs/z1WqFVxuGIUOAJsq3CcEoANTCCrlt23Ec81rggvTuf1VZlujer1YrdEysz4vYzgf5teHMbeCSr5A9/5nkx2NpmuIsWsMw3t7eBNb7QaA2L7Berw+HA8YFNDTg/QIu1+iNkXxRFMf3I/2jkQVajDzP4zherVbw7N5vkyucv7GeQBk0TcNxRmTPfw75qYdQlqXv+1jwl2OSblyiAz+HllbXdcuybNtesCv9vGimAMUKqoPkNXc6qCBA+xW74Adu8nlNp1NZsRtYNLeMRqvynufR9nwUKP3llX7nmJ+3EofDwbKsyWQi1fkty/Kr31JVdTqdTiYTdMJp+A1LTdu2MRXn+34QBGEYzj+vMAyDIPB93/u83M/LcRzbtskCF+N5Sk+tVy9aQcj8rADyW5YVxzGRnGjPGY1fT5Cf2n/XdafT6c/mTb7eg4Dv+7RDjjti4lUADRPwnlbScmIjGrZ10JYE9ffVjNmTPPnpBgiglg+CgBzG1ZhPdB5KfjywWCzEPPMG5Xf2J4jYJPBXgag8hMv0CG3fwq9d4UJ7jt5dyYqiwFcn6H0B8mNY6DiObMC4q5LmieFEhcx/FfJzNJ5PRicO58T39PnPafkxebBYLMjgR+r+e1MgIf+9lcgt0wPyK4qyXC6J4c1mn376Wrc/y7KyLGezWXMt95aZlG91ISDk70JmDOEwwNE0DSt8tZ18vBYA7X+Rn9+clFerFUx9eMvf36UcA/SSR0HgRxBAjU/u+sIwBO0vT/6yLA+HQ9OzupD/RwpePioIEPmn06miKHEco2PPm/qazBv4f/hNj4ztHFVVwfUa+V2jLoCUhCAgCNweAaztT6fT+Xze0+BTFcA5PpT85G45jmM0/jgvXch/+/KWLwoChADIr+s6nQRBPG8VziE/LITx5Gw28zxPURRKgQiCgCDwIwjANCMMQ9ri1cp5CjyT/HisKIosy2A39iO5lY8KAoIAR8BxnO12i/V4InmX8C3yU+Nv2zZPgciCgCDwIwgMb/br6/y8JhgoZ5+X4zg/klX5qCAgCBAC1Ox3NfW1cM7xoRN+/Bn4clitVmTwR0kRQRAQBK6KAK2s40yezWYDA7waybtuOZHPIX9VVcf34263w0neV82qvFwQEASaCMCkz3GcLzH/At1+zPxnWbZcLqXxbxaMhAgCV0XAsiycybFer7ta+K7wC7T8tca/dWf4VfMvLxcERouAbduTycS2bZzp0MXz1vDLkB9dCNd1yczgKQsDTizIohF5NAzD/rwMw7AsK2TX4feVJEmWZdzoCjuja10vXhgicwTgawzn/KVpmiTJnF3wIwb3Fbqu4+BzFJOiKDQw1nW9ueWJhzyi0tq2PZvNuH9ejttw+cwxP30gSRLg+4ggDkkzzs8B1bk7g91ul6bp8f0I93hUyxIyEBAOl3hC/ho437ktiiJNUzgUJQeTk8kE/gWpjuY8b5WH6MC9xcGxCEmSoGk5G8bvkr+qKt/3qdsPfO8NrO+k5+3tTVVVx3F834czTPztR5zqglah/1n5dQgCSZKQj8qqqrIsW6/XURTBnRmq7Fa21wK/oxs/9azrunDX88Pkx/kNMPUlWH8KlDO+i+2QPQ+GYbjZbJrH5mafF3m5JofZ5BIXrb2QfwiTh8cBnohPx4HS7X6/T9N0s9mEYYilKNJJLnAfhz1Ff7c/4TQeXvcNB5DHvEDLX5ZlHMfkKBIo3y1wlDDySzmZTP7999+Xlxd4pnx9ffU8b7lcHg4HspfmkH1JrpH/S89K5C8hwKFGzYtawLIsOKFQFGUymaArR3UB6cOjCKZp7na7b7b5APYC5MfKn+d54P+jkB+FjZYf5xFMp1PHcXa7HWhfc2j/JUWkyFwjZaqPYLmNUBRFkiSoAjALiAlCwzCo8X8UziOdhmHMZrOLML+qqsuQv6oqNP50bNOjYIrperipR4WapulFaH8b/ZavnESgLMskSXCOqOu6mJ/GYsGjaCmlE83+ySwPjHAx8ldVhcb/Ucx+MElpmuZsNsP0CYbrA4GTaI+FAA6eTJIkjmNMB9T4T5PWxLR7Ey7b7F+y5a+qKkkSz/Om02nN/ftdgYgVYPz1fX+9XmPFjs8kPZZaS2q/igBOGfV9H2eQoRYgxbgrdaXETCYTz/OSJPlqZnviX7LlR+fftu17Jv9kMjEMw/f9zWYD2vegIz89KwLH9yOqAL4oQEy7QwGHMl922uiS5EfPar1e3zP5LcvyfX+32z2rWku+hiNwfD8eDocwDJ3P6557/uv1Gnt4hufuZMwLkz/LsiRJiPwk3E9VGsfx4XD4/hrpSWQlwqMgkGXZYrGYzWb3pq7cohQrUHfa8vM1rSzLDMOYTqcw+7/9aApfxJHV2H2Ag6uxKklJfRTtlHTeAIE0TX3fh7bcyXK1bduaplmWdXw/ktJekP8Xa/l54sqyDIIAnShi/u37VHRkteu6+/0eq748nTdQKfnEYyGw3+/n8znsgn68u4oj0rEUdQ29vQr5aebvB917o66xLMu27aqqyCD/GiA+ln5LansQQAuxXC55l/unagFN09BuXanHei3yl2UZRdHr6+tPtfyTyQTuzbjFzpW6Tz3KJD89CgJlWaZpSgbdruv+4BQAPj2dTpfLJQC8RqN1MfI3yzjP8/l8jv3wvAqgAfmVKlS833Xd1g05FxwyNbMsIY+LAGcXlGS9XsNnzs1GrFBdeItwXXexWNDMNE/epUC+IvmrqsrzPAzDVv7/CPMvhZq85ykRqBGsKIooiuAs4Db85+QPgqCV+Rdsva5Lfgy2W/l/DfL3t/lPqa+SqQsiUCN/VVVFUazXazqc9hpKW3unqqrYb7Lf75E1nirIl8ry1cnP+Q9y4m8tzxe5xQRJrbd/wZryUqDLe+4TAU4zPlW02Wxuxn+45fU8DxDxJJF8KfRuQf6qqpbLJXlWuxL5DcMIgiCO40tteLwUxPKeh0Og1mCUZbndbm/gqB4bjaMoog7/VaG7EfnhffF6Lb9hGJ7nCfOvqitjfjnx/6pLgJqm3Yz5F97V16oc5IM1TVM4Ubh4yw/mr9drafNbi0ACL4IA+I+9gBcZpdZegmaf2vxa7+MiWai95LotP7ysHd+PcKuElb/vkx+TIlgLJeanaVrLm9wKApdF4Kr8R7OPBF92Yq8LhCuSHxkgr9XwtRxF0ff9/E+nU1g+vry8WJa13++xoZAgu0Gt2QWohD83Asf343a7DYLggk5rMMm3WCxuDN3VyV+rAtI0/Sb/4WbTNE04Dlgul+RaF9+iKuDGUMrnRoIA8f+CJoDL5TL7vG6J4a3JT+1/bcBzxq3rumA+b+eJ/7cEUb41NgTAf9u2z9Db5iOLxQJmxTeetPoB8oP/2K7YBGJICLwvzWYzjPOpqSfm8+pgbHop+b0NAsf3YxiGaPzRbx+iuq1xcOjIjZl/o9l+zkmaAqiqynGct7e3k6epkYt1EnRd932/WcbC+SYmEnJVBNAOKYpCyjlQcBxnMplYlpXnOSfIVVNbe/kVW358iWeMZFRyu93Otm2auh+ImmEY2K6HfY61/MitIHBLBPI856cADNdh0zRd143jmEgB4ZaJ/xnyUxO92+2G40UxwzAERrQoekvI5FuCABCAGsP4n5RzoOC6bpIksILh/L8ltj9GfuI/Bk4DIUM0cr9JL7klZPItQaCGQBAEX1JgwzDW6zVewpl/Y32+OvlrMPEM0/g/iiKs2/Uj+Pr6qijKarWiB28MVmteJHDMCBB14fyjX4FplXqxWJDq0hsg3BLMuyA/Fv/7+W+apmEYq9UKGy2x6YqAuyVk8i1BgBAgDcTO/5PkN01zsVi0WqaMi/wEHC3+9/BfVdXZbIYTS9Dy0+NUiVKRiCAI3AYBUsI0TU82/ieZf2NN/smWn4ADmcn4r7X6VBTFtm2MlIT8t9Fs+cpJBEiH4bEabn9bFdgwDGrza/1W/pKTX7xghJ8hPzJAeeb5mc/ndIIaNwHAnidd1/k0aQ1E/h6RBYEbIAAdzrJsuVzioNom803TdBzHMIw0TUnnu4QbpJk+cXfkx85/8B+O02po6roehuGPL5MQgiKMFgHOfMdxMC1VU1diPg7b6uI8hd8SzJ8kf2s+j+9H4j9t/m0CSvwn1G48XmpNvASOCoGyLNHmdzEfBmmGYcB0n+tql3xLAO+R/MR/2P+3tv+mabbynzC9JYjyrXEicJL5aLToLABSzh7hlkjeHfl55pfLpeM4uq5jwF9r/3HLfXh0YcrfKbIgcDYCcE4D4/SiKPguHa6clmVNp1Nd16MoOvtbN3jwrslPNSuf+eMoG4bh+z45OSbjH5kIvIHqjPYTRVFst1vXdbvIP51O+dz+3QJ11+THVke0/zXO062maY7jwF23kP9u9expEoad/LQhlfhPCgkhiiLq7d9t3u+d/MT/Grh0O/28TNNcLpdC/rvVs6dJGBx4wlCXH+NDCsnbfNik3W3eH4D8wG61WmGxlKMMVwqKoqiqCuvA2u5ozALcLfqSsPtEACtHNIWEeaU8z03TxOldqqpy5mNaStM00zRxovZ95quWqochf57nJ/kP+8om/2t5lltBoB8B0J46klVV7fd7z/NA8ibzdV3Hej5c8fW//H5+fRjy49hP8L9pTaHruqIosP8zDCPPcz7ndz9wS0oeAoEa+fM89zxPURRue0ajfQi+72+328cyNnkk8hP/W+0oUSsT/3e7HfH/IRROEvmzCPARYo38OKXH/LxqnKdbWnL62Vx86esPRn5y3RUEAfpafAoAJYFDTk3T9DwPqwCPVR9/qfwk8qUQoHE+vTBN0zAMp9MpHTNnGAZ6ndA0nN7puu7x/Yj6gtcg9J67FR6P/NjPn6bpYrForv8T/1FPowo4HA7C/7tVwftM2Gq1CoIAs8hEfhibEf+xRTdNUyH/7QoRrvvSNMXBKbzxx/w/WQSiCgjDUPh/u+J55C8d34+73W69XpNReQ//oyiCtV9tjvlRAHjIlr+qKpz/V1VV04MKDf6pX2BZlvD/UTTyB9N5OBxWq5XrurSMh7U9HDDXbP+RVN7hl27/rYsvz3NYAWqahmUYXk5UhTuOgzVYTATeOpXyvbtEAP5zkTTsyUfnEd1JGjw6n5dt247jhGG43+/pjA0h/88XLNZjeviPjoCu63EcY+Lg5xMtKfhpBDAZlKapbdue53Hmg/9kwIOJ5M1mg4NhkfAm8x9odulRu/2tOhPHsed5Tf7Teoyu6zhfzfM82AK0vkcCR4XAcrnEoc/EfG5IAnUyDGM2m83nc95tbGW+kP9nlCfPc+I/7/kT+Q3DQAWPKgC2AD+TVvnqfSAwm808z7MsCwNG3tuniWTbtoMgiOMYXneJ3kL++yjD36mAc5XtdjuZTHCCGjGfuv0UMpvNunZfUbn+frH8//AIUKNdFMVut1ssFp7n2bYNGx60FlAS2OqSL+mHz3lHBp6q2095hNMF0zRfX1+J6pz8sNawLMv+nMIJgoAqdaI9BHqnCE+DAGiPTj4N6WmGnxTGtu0wDDFD9DR55xl5TvIjh0VRzOfzt7c36r9ReaOAebjv+4fDIc/zmqNFDpbIj4vA4XCAeehsNoMa8IEhNfvEfJrVf9wsn0z5M5O/qqo0TeM45iSn0kV5Y2O2qqqTyQSnpsIvMLX/JxGUCHeFAA3Ia6kqigIm4bDJJeZ3tfy73S5Jkuc+CfZpyU/sLcsyTdPNZkMHqnD+o+xr1gHL5TKO4+P78bnLvkaPJ7gF8zn/4QwWtrqu69Lwnsb2WMCzfl+z2Wy1Wo2k9zcK8mMKAFUAPIIQ/1uF19dXy7KwN5tr0hPQYzxZQKW/Wq1ms1ltVo+afer3YZNYEATYCYYBArUfzwraWMiPgjy+H8kjSCvtySuDZVlwELBarWRfwGNpP9nng/ZE9aagqipK2fO8MAzJZpxoD+Gxsj88teMiPxYCif+1+T9SDlrytSzLcZwgCFAFDIdVYl4VgZ7uGLfPpwKFUBvcIdCyLPjhIH+b5J+bqoCr5uUHX/605O/BFIcCr1YrLOfiuBWa+KGuIHSFdxA2mw0mjWsvJy3pUcraI3L7HQQIcHpJURTH9+N+vydr/JqV3nQ6VVUVPTtN08iv/na73e/3WZZhWy5e+NwNPoE2RvIj89iYEUURnaZGk3/km7XWdCiK4rruZrOhTR1cV0aiMaQ69yOUZbndbmezGbhN/KdVHtqchyKGl4ftdpskCdF+hBX3eMlPToGyLHNdl1t3w5ybdwEg+76P+ULLsvhAgBqiESrQNaqAgTAe34+Hw2G73WL4BtttlCP4T+THlL5t267rzmYzOiqbnHBcIxf3/87xkh97OeGGoaqq9XoN1yDkp6VZBcAIDBMBsPem6UDi//0X+f2ncEgfKkmSzWbj+z7M8hVFmUwmOCqnyXzDMF5eXgzDWC6X/Hy3+4fiqikcL/mbyzk4jCUIAk3T7E+zX8uyDMOo1QLkJogalvl8vt1u+aDxqmX23C9HpUx2+MgshvRZlsVxHEURbPJROpiUwQCNrLZpKtf+vHRdRxmlaSq7OUl/hPzUZpcABes9VAVgiRhVAK8FaDoA00iu60K9sizL8/z4fsTfgT1YKg8R4C2/hsPx/ZhlGWhPdS6EGvnR7UdJ4YANz/OSJAHtpTg4sEL+P+SHRHMB+/0eO38+G4+PvV9kE95cNIIKuq47nU5936e+Jdox0Tmuc/0yrbRRtCRJYJlbo32T/OS1ibZswfEGLPbohSIAASF/nfxQPlIXzAWA/3xSkC8B0jIhdTsxvbzdblELCPm/yrckSbD3jpboWplP3Xt0xGC0g7Nbfd+Hv6ba0sxXU/LE8UdN/q5y5fUBTgrZbrdBEMAynFYBmptAqeUB+X8bjH/8v9lsqDuA7/KvoK/LQ7rS9kzhVM9i2hV2+Pv9Hj6zwWcY4deYj5oX0/uO42Dwj/Pa1+v1fr/nRzY9E2KXzYuQvwVPTkLIqALW63UYhtA2au2bVQCpJlfZyWRimmYQBOv1uqctok+3JOspgmiRBZumiP+73S6KIvvzorkVmlihioB3uDRNUxQFM/y+7282myRJOO2p7J4CuctnQsjfgikxkAuYC8iybLfbLZdLrPmfrAJIWd8+L1QBuq57nrdcLjebTZZlVBfUPteSsmcJyrJsv9+naQo7y5eXF/SS4CS7aVtJMHKBWn7QnqPH5WfB7PL5EPK3YMpVh2QeryiK/X6/Wq1QBWAusNk68U4BegFYgoZtKRzFwLYcFQF9697mCC6YHvjPsm1bURQsmsJu4vX1FbDQxCqWUTjbuTydTuF/gYPWKvOCE5kjIOTnaJwpbzabMAxp5InuKJSb6ysfvqLLQBOEaPdwyuhqtYLVABwKEPGw1k3dhDPTetZjIBUdWY3VUCzFU/L4ixGfQtClxx4KVIKApVldAhAsrE4mk5eXl8lkQka7hmHAwc56vYazDVpPbaU9D6TEiEAICPkJim8JcBYQhiEYDktSdGJr/KcqANOH9KuqqpjZtixrNpv5vj/7fZEZIi0ccjb+rIrzrxdFkWVZkiT7/T78fQVBAC8avB9Eue4SUIHCaE9VVdjnLhaLOI6zLEvTlNvk8zR0yd8q3Sd9WMh/yYJN07QsyziOfd83TRMOwruUnk8Hkh2hoijo7lL3ASGmabqui2mtze+r5miIWuZWO5lv5hOkar4kZhf1fU4ui3RxnsLBdsdxJpOJ4zjb7RYdjdY8dhGehzdTLiFC/svrQFmWeZ4fDgff9/v5T7reL2D5ejKZ1CyLaVt6mwAAApZJREFUp9OpZVlBEERRtP19xXEMT6RddD0vw79f//G/zS5azqTdNY7jkMOs/ny1/oq60jRNHJKBedb882odYtTMtDnhuXxerp/7KSH/VcqXDNQxbj++H6MowgmQ1BHgLT/fi9JKCV3XYV9Aj1M0vAdvoDlzugUVPc/zfT8Mw3nvFYYhvN9Q2ugrXQLFrAmt8TGk13V9Mplghg/Dfk3TXl5edF33fX+5XCZJwqc2iMNXKaoRv1TIf5XCJ30lAScLY64bNufTz4uGtWQyTCxq5c95gfRO0A9VQ+tfxDzvKyefwlCItkv873//e3t7QyOPwXyzMAjArma/+YiEDERAyD8QqK9F4yoLmZ7HQD1JkvV6je4AzQuiGQSFiK4nGfVYEdBzge09Riu1mQsCqgdDiiPCdxAQ8n8Hvc5nm4rLZ6rwGE4WLIricDigIsChcfdQBVyv/V+tVnEcp2nKO/YApAlaLaQTbvnhLASE/GfBdomHoNmoFLAFGItY6efl/r4cx7FtmwbzqBrQfzYMg280QKMK21isEdBQorU3UZs+oL4GCTRxAIHXCDRWp34H7O0wwWma5mQysSwrDEP4O+Ge8C8BnrzjAggI+S8A4qVegeqg+bY5uzjZuJcBYjIZxpORLEgLy7kageltZH1AzIcZEq8+aL6AaiJ6J96D+fnFYjGfz8kZLmbjf9BCqYmnhAABIf89agJ1CprVQZ7n+/0eC2+LxSIIAs/zXNcF/YjnNLXm/L7Qfai14UR1Inb/LCCi0W55x3HYMn9cg5JyQbaAMmlXg+hnb4X8P4v/6a9j1RBLhsQieB/Hw9gkc2DXYrGIPq/5fB6GYfB5we5oIPnRtuMl+JuwqyvRzaoKMRHe9WvX2yT82gj8fwsvPBNQDSIjAAAAAElFTkSuQmCC";

pub fn sql_nil<T>() -> Option<T> {
    return None;
}

pub fn hash_password(password: &str, salt: &str) -> String {
    let mut builder = String::new();

    let text = password.to_owned() + salt;

    let hash_bytes = Sha512::digest(text.as_bytes()).to_vec();

    for b in hash_bytes {
        let hexd = format!("{:02X}", b);
        builder.push_str(&hexd);
    }

    return builder;
}

pub fn get_unix_time() -> Duration {
    return SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap();
}

pub fn create_salt_sha256() -> String {
    let mut builder = String::new();

    let unix = get_unix_time();
    let unix_string = unix.as_nanos().to_string();

    let hash_bytes = Sha256::digest(&unix_string).to_vec();

    for b in hash_bytes {
        let hexd = format!("{:02X}", b);
        builder.push_str(&hexd);
    }

    return builder;
}

pub fn cmp_password(password: &str, salt: &str, expected: &str) -> bool {
    let result = hash_password(password, salt);
    return result == expected;
}

pub fn is_logged_in(session: &Session) -> Option<BaseUser> {
    match session.get::<BaseUser>("b") {
        Ok(Some(base_user)) => return Some(base_user),
        _ => return None,
    }
}

pub fn is_password_ok(password: &str) -> bool {
    if password.len() < 6 {
        return false;
    }

    return true;
}

pub fn is_username_ok(username: &str) -> bool {
    if username.len() > 32 {
        return false;
    }

    let byte_array = username.as_bytes();
    for c in username.chars() {
        if !USERNAME_CHARSET.contains(c) {
            return false;
        }
    }

    for (index, c) in username.chars().enumerate() {
        if index == username.len() - 1 {
            break;
        }

        let next_char = byte_array[index + 1] as char;
        if c == '.' && c == next_char {
            return false;
        }
    }

    if byte_array[byte_array.len() - 1] == '.' as u8 {
        return false;
    }

    return true;
}

pub fn is_email_ok(email: &str) -> bool {
    let re = Regex::new("(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])").unwrap();
    return re.is_match(email);
}

pub fn parse_base64_image(data: &str) -> (String, Vec<u8>) {
    use base64::{engine::general_purpose::STANDARD, Engine as _};

    let img_chunks = data.split(',').collect::<Vec<_>>();

    let image_bytes = STANDARD.decode(img_chunks[1]).unwrap();

    let content_type = img_chunks
        .into_iter()
        .nth(0)
        .unwrap()
        .split("data:")
        .nth(1)
        .unwrap()
        .split(";")
        .nth(0)
        .unwrap();

    return (content_type.to_owned(), image_bytes);
}

pub async fn get_follower_and_following_count(
    user_id: u64,
    manager: &Manager,
) -> Result<(u64, u64), Box<dyn std::error::Error>> {
    let follower_table_name = format!("USER_{user_id}_FOLLOWERS");
    let following_table_name = format!("USER_{user_id}_FOLLOWINGS");

    let follower_count = sqlx::query(&format!("SELECT id FROM {}", follower_table_name))
        .fetch_all(&manager.pool)
        .await?
        .len();


    let following_count = sqlx::query(&format!("SELECT id FROM {}", following_table_name))
        .fetch_all(&manager.pool)
        .await?
        .len();

    return Ok((follower_count as u64, following_count as u64));
}

pub async fn get_post_likes_and_comment_count(
    post_id: u64,
    manager: &Manager,
) -> Result<(u64, u64), Box<dyn std::error::Error>> {
    let likes_table_name = format!("POST_{post_id}_LIKES");
    let comments_table_name = format!("POST_{post_id}_COMMENTS");

    let likes = sqlx::query(&format!("SELECT * FROM {}", likes_table_name))
        .fetch_all(&manager.pool)
        .await?
        .len();


    let comment_count = sqlx::query(&format!("SELECT * FROM {}", comments_table_name))
        .fetch_all(&manager.pool)
        .await?
        .len();

    return Ok((likes as u64, comment_count as u64));
}

pub async fn is_post_liked_by_me(
    post_id: u64,
    user_id: u64,
    manager: &Manager,
) -> Result<bool, Box<dyn std::error::Error>> {
    let likes_table_name = format!("POST_{post_id}_LIKES");

    let likes = sqlx::query(&format!("SELECT * FROM {} WHERE id = ?", likes_table_name))
        .bind(&user_id)
        .fetch_all(&manager.pool)
        .await?;

    return Ok(likes.len() > 0);
}

pub fn ensure_media_is_good(imedia: &mut IMedia) -> bool {
    if imedia.media_base64.len() > 16_776_000 {
        return false;
    }

    use base64::{engine::general_purpose::STANDARD, Engine as _};

    let b64_reference = imedia.media_base64.as_str();

    let chunks = b64_reference.split(',').collect::<Vec<_>>();

    if chunks.len() != 2 {
        return false;
    }

    let media_content = chunks[1];

    let b64_regex =
        Regex::new("^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$").unwrap();
    let is_content_base64_encoded = b64_regex.is_match(media_content);

    if !is_content_base64_encoded {
        return false;
    }

    let image_bytes = STANDARD.decode(media_content).unwrap();

    let fmt = match image::guess_format(&image_bytes) {
        Ok(f) => f,
        _ => return false,
    };

    imedia.media_base64 = format!("data:{};base64,{}", fmt.to_mime_type(), media_content);
    return true;
}

pub fn ensure_pfp_is_good(pfp: &mut IProfilePhoto) -> bool {
    if pfp.photo.len() > 16_776_000 {
        return false;
    }

    use base64::{engine::general_purpose::STANDARD, Engine as _};

    let b64_reference = pfp.photo.as_str();

    let chunks = b64_reference.split(',').collect::<Vec<_>>();

    if chunks.len() != 2 {
        return false;
    }

    let media_content = chunks[1];

    let b64_regex =
        Regex::new("^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$").unwrap();
    let is_content_base64_encoded = b64_regex.is_match(media_content);

    if !is_content_base64_encoded {
        return false;
    }

    let image_bytes = STANDARD.decode(media_content).unwrap();

    let fmt = match image::guess_format(&image_bytes) {
        Ok(f) => f,
        _ => return false,
    };

    pfp.photo = format!("data:{};base64,{}", fmt.to_mime_type(), media_content);
    return true;
}

pub async fn create_short_code(manager: &Manager) -> Result<String, Box<dyn std::error::Error>> {
    loop {
        let short_code = Alphanumeric.sample_string(&mut rand::thread_rng(), 12);

        let post = sqlx::query("SELECT * FROM Posts WHERE short_code = ?")
            .bind(&short_code)
            .fetch_optional(&manager.pool)
            .await?;

        if let None = post {
            return Ok(short_code);
        }
    }
}

pub async fn user_id_exists(
    manager: &Manager,
    id: u64,
) -> Result<bool, Box<dyn std::error::Error>> {
    let existing_user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
        .bind(&id)
        .fetch_optional(&manager.pool)
        .await?;

    return match existing_user {
        Some(_) => Ok(true),
        _ => Ok(false),
    };
}

pub async fn is_username_available(
    manager: &Manager,
    username: &str,
    id: Option<u64>,
) -> Result<bool, Box<dyn std::error::Error>> {
    let existing_user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE username = ?")
        .bind(&username)
        .fetch_optional(&manager.pool)
        .await?;

    return match existing_user {
        Some(user) => match id {
            Some(x) => Ok(user.id == x),
            _ => Ok(false),
        },
        _ => Ok(true),
    };
}

pub async fn is_email_available(
    manager: &Manager,
    email: &str,
    id: Option<u64>,
) -> Result<bool, Box<dyn std::error::Error>> {
    let existing_user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE email = ?")
        .bind(&email)
        .fetch_optional(&manager.pool)
        .await?;

    return match existing_user {
        Some(user) => match id {
            Some(x) => Ok(user.id == x),
            _ => Ok(false),
        },
        _ => Ok(true),
    };
}

pub async fn is_following(
    my_id: u64,
    their_id: u64,
    manager: &Manager,
) -> Result<bool, Box<dyn std::error::Error>> {
    let me: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
        .bind(&my_id)
        .fetch_optional(&manager.pool)
        .await?;

    if let None = me {
        return Ok(false);
    }

    let them: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
        .bind(&their_id)
        .fetch_optional(&manager.pool)
        .await?;

    if let None = them {
        return Ok(false);
    }

    let their_follower_table = format!("USER_{their_id}_FOLLOWERS");

    let row = sqlx::query(&format!(
        "SELECT * FROM {} WHERE id = ?",
        their_follower_table
    ))
    .bind(&my_id)
    .fetch_optional(&manager.pool)
    .await?;

    return Ok(row.is_some());
}

pub async fn is_comment_liked_by_user(
    user_id: u64,
    post_id: u64,
    comment_id: u64,
    manager: &Manager
) -> Result<Option<bool>, Box<dyn std::error::Error>> {

    let table_name = format!("POST_{}_COMMENT_{}_LIKES", post_id, comment_id);

    let result = sqlx::query(&format!("SELECT * FROM {} WHERE id = ?", table_name))
        .bind(&user_id)
        .fetch_all(&manager.pool)
        .await;

    if let Err(_) = &result {
        return Ok(None);
    }

    let entries = result.unwrap();

    Ok(Some(!entries.is_empty()))
}

pub async fn get_comment_likes_count(
    post_id: u64,
    comment_id: u64,
    manager: &Manager
) -> Result<u64, Box<dyn std::error::Error>> {
    let table_name = format!("POST_{}_COMMENT_{}_LIKES", post_id, comment_id);
    let liker_owner_ids = sqlx::query(&format!("SELECT * FROM {}", table_name))
        .fetch_all(&manager.pool)
        .await?;

    return Ok(liker_owner_ids.len() as u64);
}