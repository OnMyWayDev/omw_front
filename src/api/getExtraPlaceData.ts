import {getKakaoPlace} from './getKakaoPlace';

export const getExtraPlaceData = async (placeId: string) => {
  try {
    const res = await getKakaoPlace(placeId);
    //legacy commented
    // console.log('getExtraPlaceData', res);
    // let scoreAvg;
    // if (
    //   res.comment?.scorecnt &&
    //   res.comment?.scorecnt !== 0 &&
    //   res.comment?.scoresum
    // ) {
    //   const scorecnt = res.comment?.scorecnt;
    //   const scoresum = res.comment?.scoresum;
    //   scoreAvg = ((scoresum / (scorecnt * 5)) * 5).toFixed(1);
    // }
    return {
      open:
        res.business_hours?.real_time_info?.business_hours_status?.code ===
        'OPEN', //updated
      tags: res.place_add_info?.facilities?.tags, //updated
      photoUrl: res.photos?.photos[0]?.url
        ? res.photos?.photos[0]?.url.replace(/^http:\/\//i, 'https://')
        : null,
      commentCnt: res.kakaomap_review?.score_set?.review_count, // updated
      reviewCnt: res.blog_review?.review_count, // updated
      parking: res.place_add_info?.facilities?.is_parking, // updated
      scoreAvg: res.kakaomap_review?.score_set?.average_score, // updated
    };
  } catch (error) {
    console.error(error);
    return {};
  }
};
