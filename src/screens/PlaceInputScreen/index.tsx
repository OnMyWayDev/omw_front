import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  Text,
  Alert,
  View,
  FlatList,
} from 'react-native';
import PlaceInputHeader from '../../components/headers/placeInputHeader';
import NoHistorySVG from '../../assets/images/noHistory.svg';
import {useRecoilState, useRecoilValue} from 'recoil';
import {navigationState} from '../../atoms/navigationState';

import {useNavigation} from '@react-navigation/native';
import {whichNavState} from '../../atoms/whichNavState';
import {getCurPosition} from '../../config/helpers/location';
import {getAddress} from '../../api/getAddress';
import {get, store} from '../../config/helpers/storage';
import {RECENT_KEY} from '../../config/consts/storage';
import Spinner from '../../components/spinner';
import PlaceQueryResult from '../../components/placeQueryResult';
import {recentPlaceDetail} from '../../config/types/place';
import Toast from 'react-native-toast-message';

export default function PlaceInputScreen() {
  //FIXME: choose what to edit
  //FIXME: add 'keyboard.dismiss()' when user clicks outside of the input box
  //FIXME: use keyboardavoidingview so that the SVG is located differently when the keyboard is open
  //TODO: use asyncstorage => Use JSON.stringify() and JSON.parse() to store and retrieve objects and arrays.
  //FIXME: "검색 결과가 없습니다!!" 표시해주기!!!
  const [resultList, setResultList] = useState<any[]>([]);
  const [isResult, setIsResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [, setNav] = useRecoilState(navigationState);
  const whichNav = useRecoilValue(whichNavState);
  const navigation = useNavigation();

  const handlePress = async (result: any) => {
    switch (whichNav) {
      case 'start':
        setNav(prev => {
          return {
            ...prev,
            start: {
              name: result?.placeName || result?.addressName,
              coordinate: result?.coordinate,
            },
          };
        });
        break;
      case 'end':
        setNav(prev => {
          return {
            ...prev,
            end: {
              name: result?.placeName || result?.addressName,
              coordinate: result?.coordinate,
            },
          };
        });
        break;
      case 'editWayPoint1':
        setNav(prev => {
          const newWayPoint = {
            name: result?.placeName || result?.addressName,
            coordinate: result?.coordinate,
          };
          return {
            ...prev,
            wayPoints:
              prev.wayPoints.length === 2
                ? [newWayPoint, prev.wayPoints[1]]
                : [newWayPoint],
          };
        });
        break;
      case 'editWayPoint2':
        setNav(prev => {
          return {
            ...prev,
            wayPoints: [
              prev.wayPoints[0],
              {
                name: result?.placeName || result?.addressName,
                coordinate: result?.coordinate,
              },
            ],
          };
        });
        break;
      case 'newWayPoint':
        setNav(prev => {
          return {
            ...prev,
            wayPoints: [
              ...prev.wayPoints,
              {
                name: result?.placeName || result?.addressName,
                coordinate: result?.coordinate,
              },
            ],
          };
        });
        break;
    }
    //store to RECENT
    const prev = await get(RECENT_KEY);
    const newPlaces: recentPlaceDetail[] = [];
    //FIXME: type issue here
    prev?.places.forEach(place => {
      //push if the address is not already in the list
      if (place.addressName !== result?.addressName) {
        newPlaces.push(place);
      }
    });
    newPlaces.push({
      placeName: result?.placeName,
      addressName: result?.addressName,
      roadAddressName: result?.roadAddressName,
      coordinate: result?.coordinate,
    });
    await store(RECENT_KEY, {
      places: newPlaces.reverse(),
    });

    navigation.goBack();
  };

  const onCurPosPress = async () => {
    try {
      const curPos = await getCurPosition();
      const res = await getAddress(curPos);
      handlePress({
        addressName: res.address,
        roadAddressName: res.roadAddress,
        coordinate: curPos,
      });
    } catch (error) {
      console.error(error);
      Alert.alert(
        '',
        '현재 위치를 가져오는데 실패했습니다.\n설정에서 위치 권한을 확인해주세요',
      );
    }
  };

  const onMount = async () => {
    const history = await get(RECENT_KEY);
    if (history) {
      setIsResult(true);
      setResultList(history.places);
    }
  };

  useEffect(() => {
    onMount();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white w-full h-full">
      <PlaceInputHeader
        setResultList={setResultList}
        setIsResult={setIsResult}
        onCurPosPress={onCurPosPress}
        setLoading={setLoading}
      />
      {/* FIXME: use keyboardavoidingview only when there's NO history!!!! */}
      <Pressable
        className="flex-1"
        onPress={() => {
          Keyboard.dismiss();
        }}>
        {loading ? (
          <Spinner />
        ) : (
          <KeyboardAvoidingView
            className="flex-1 items-center justify-center"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled={!isResult || resultList.length === 0}>
            {isResult && resultList.length > 0 ? (
              <FlatList
                style={{width: '100%'}}
                data={resultList}
                renderItem={({item: result, index: idx}) => (
                  <PlaceQueryResult
                    key={idx.toString()}
                    placeName={result.placeName}
                    roadAddressName={result.roadAddressName}
                    addressName={result.addressName}
                    coordinate={result.coordinate}
                    onPress={() => {
                      handlePress(result);
                    }}
                  />
                )}
                keyExtractor={(i, index) => index.toString()}
              />
            ) : (
              <NoHistorySVG height={130} width={130} />
            )}
          </KeyboardAvoidingView>
        )}
      </Pressable>
    </SafeAreaView>
  );
}
