import React, {useEffect, useMemo, useRef, useState} from 'react';
// import {FlatList} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {useRecoilState, useRecoilValue} from 'recoil';
import {modalState} from '../../atoms/modalState';
import {listModalState} from '../../atoms/listModalState';
import BottomSheetComponent from './bottomSheetComponent';
import {PlaceDetail} from '../../config/types/coordinate';
import ListBottomSheetComponent from './listBottomSheetComponent';
import {FlatList, NativeViewGestureHandler} from 'react-native-gesture-handler';
import {View, Text, TouchableOpacity} from 'react-native';
import {selectedPlaceIndexState} from '../../atoms/selectedPlaceIndexState';
import {
  filterByOpen,
  sortByReview,
  sortByScore,
} from '../../config/helpers/filter';
import FilterSVG from '../../assets/images/filter.svg';

export default function ListBottomSheet({
  result,
  setResult,
  originalResult,
  showAlternative,
}: {
  result: PlaceDetail[] | null;
  setResult: (result: PlaceDetail[]) => void;
  originalResult: PlaceDetail[] | null;
  showAlternative: boolean;
}) {
  const [, setModalVisible] = useRecoilState<boolean>(modalState);
  const [listModalVisible, setListModalVisible] =
    useRecoilState<boolean>(listModalState);
  const [, setSelected] = useRecoilState<number>(selectedPlaceIndexState);

  const [selectedObj, setSelectedObj] = useState({
    open: false,
    score: false,
    review: false,
  });

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['23%', '50%', '77%'], []);

  const selectTextColor = (selected: boolean): string =>
    selected ? '#2D7FF9' : '#A8A8A8';
  const selectBorderColor = (selected: boolean): string =>
    selected ? '#9CC7FF' : '#A8A8A8';
  const selectBGColor = (selected: boolean): string =>
    selected ? '#EBF2FF' : 'transparent';
  //@ts-ignore
  const selectedNum = () => {
    let count = 0;
    for (const key in selectedObj) {
      //@ts-ignore
      if (selectedObj[key]) count++;
    }
    return count;
  };

  const handleClickIsOpen = () => {
    //FIXME: async/await 적용, loading 추가
    if (selectedObj.open) {
      //on unselect
      if (selectedObj.score) {
        const sorted = sortByScore(originalResult || []);
        setResult(sorted);
      } else if (selectedObj.review) {
        const sorted = sortByReview(originalResult || []);
        setResult(sorted);
      } else setResult(originalResult || []);
      setSelectedObj({
        ...selectedObj,
        open: false,
      });
    } else {
      if (result) {
        const filtered = filterByOpen(result);
        setResult(filtered);
      }
      setSelectedObj({
        ...selectedObj,
        open: true,
      });
    }
  };

  const handleSortByScore = () => {
    if (selectedObj.score) {
      //on unselect
      if (selectedObj.open) {
        const filtered = filterByOpen(originalResult || []);
        setResult(filtered);
      } else {
        setResult(originalResult || []);
      }
      setSelectedObj({
        ...selectedObj,
        score: false,
      });
    } else {
      if (result) {
        const sorted = sortByScore(result);
        setResult(sorted);
      }
      setSelectedObj({
        ...selectedObj,
        review: false,
        score: true,
      });
    }
  };

  const handleSortByReview = () => {
    if (selectedObj.review) {
      //on unselect
      if (selectedObj.open) {
        const filtered = filterByOpen(originalResult || []);
        setResult(filtered);
      } else setResult(originalResult || []);
      setSelectedObj({
        ...selectedObj,
        review: false,
      });
    } else {
      if (result) {
        const sorted = sortByReview(result);
        setResult(sorted);
      }
      setSelectedObj({
        ...selectedObj,
        score: false,
        review: true,
      });
    }
  };

  useEffect(() => {
    if (listModalVisible) {
      setModalVisible(false);
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.close();
      if (showAlternative) setModalVisible(true);
    }
  }, [listModalVisible]);

  useEffect(() => {
    setSelectedObj({
      open: false,
      score: false,
      review: false,
    });
  }, [originalResult]);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onDismiss={() => setListModalVisible(false)}
        enableDismissOnClose
        style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.32,
          shadowRadius: 5.46,
          elevation: 9,
        }}>
        <BottomSheetView
          style={{
            flex: 1,
            height: '100%',
            paddingHorizontal: 18,
          }}>
          <View className="flex-row gap-x-2 items-center">
            <View
              className="flex-row justify-center items-center gap-x-1 border-[0.5px] pl-1 pr-2 py-1 rounded-full"
              style={{
                borderColor: selectedNum() ? '#9CC7FF' : '#A8A8A8',
                backgroundColor: selectedNum() ? '#EBF2FF' : 'transparent',
              }}>
              <FilterSVG />
              {selectedNum() && (
                <Text style={{color: '#A8A8A8'}}>{selectedNum()}</Text>
              )}
            </View>
            <TouchableOpacity
              className="px-2 py-1.5 rounded-xl border-[0.5px]"
              style={{
                borderColor: selectBorderColor(selectedObj.open),
                backgroundColor: selectBGColor(selectedObj.open),
              }}
              onPress={handleClickIsOpen}>
              <Text
                className="text-xs"
                style={{color: selectTextColor(selectedObj.open)}}>
                영업중
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-2 py-1.5 rounded-xl border-[0.5px]"
              style={{
                borderColor: selectBorderColor(selectedObj.score),
                backgroundColor: selectBGColor(selectedObj.score),
              }}
              onPress={handleSortByScore}>
              <Text
                className="text-xs"
                style={{color: selectTextColor(selectedObj.score)}}>
                평점 좋은 순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-2 py-1.5 rounded-xl border-[0.5px]"
              style={{
                borderColor: selectBorderColor(selectedObj.review),
                backgroundColor: selectBGColor(selectedObj.review),
              }}
              onPress={handleSortByReview}>
              <Text
                className="text-xs"
                style={{color: selectTextColor(selectedObj.review)}}>
                리뷰 많은 순
              </Text>
            </TouchableOpacity>
          </View>
          {result && (
            <FlatList
              className="flex-1 w-full pt-2 flex-col"
              data={result}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => (
                <ListBottomSheetComponent
                  placeInfo={{
                    ...item,
                  }}
                  onSelect={() => {
                    setListModalVisible(false);
                    setModalVisible(true);
                    setSelected(index);
                  }}
                />
              )}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
            />
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}
