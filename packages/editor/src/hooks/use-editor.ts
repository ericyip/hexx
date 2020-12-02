import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import {
  blockIdListAtom,
  blockMapAtom,
  blockSelectAtom,
  blocksIdMapAtom,
  hoverBlockAtom,
} from '../constants/atom';
import { insert } from '../utils/insert';

export const EditableMap = new WeakMap<
  HTMLDivElement,
  {
    blockIndex: number;
    index: number;
    id: string;
  }
>();

export function useBlock(id: string, blockIndex?: number) {
  const {
    removeBlockWithId,
    updateBlockDataWithId,
    IdMap,
  } = useEditor();
  const remove = () => {
    removeBlockWithId({ id });
  };

  const update = (block) => {
    if (typeof block === 'function') {
      updateBlockDataWithId(block);
    } else {
      updateBlockDataWithId({ id, data: block });
    }
  };

  const register = useCallback(
    (ref, index: number = 0) => {
      if (typeof blockIndex === 'undefined') {
        throw new Error(
          'register editable block must provide blockIndex.',
        );
      }
      if (ref) {
        EditableMap.set(ref, { index, id, blockIndex });
      }
    },
    [blockIndex],
  );

  const registerWithIndex = useCallback(
    (index: number) =>
      useCallback((ref) => {
        register(ref, index);
      }, []),
    [register],
  );

  return {
    block: IdMap[id],
    remove,
    update,
    registerWithIndex,
    register,
  };
}

export function useEditor() {
  const [hoverBlock] = useAtom(hoverBlockAtom);
  const [blockMap] = useAtom(blockMapAtom);
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const [idList, setIdList] = useAtom(blockIdListAtom);
  const [IdMap, setIdMap] = useAtom(blocksIdMapAtom);

  const findBlockIndexById = (id: string) => {
    return idList.findIndex((d) => d === id);
  };

  const selectBlock = (id: string) => {
    const index = findBlockIndexById(id);
    setBlockSelect(index);
  };

  const insertBlockAfter = ({
    id,
    block,
  }: {
    id: string;
    block: any;
  }) => {
    let newBlock = {
      ...block,
      id: v4(),
    };
    const currentBockIndex = findBlockIndexById(id);
    if (currentBockIndex > -1) {
      setIdList(insert(idList, currentBockIndex + 1, newBlock.id));
      setIdMap((s) => ({
        ...s,
        [newBlock.id]: newBlock,
      }));
    }
  };

  const insertBlock = ({
    index,
    block,
  }: {
    index?: number;
    block: any;
  }) => {
    let newBlock = {
      ...block,
      id: v4(),
    };
    if (typeof index === 'undefined') {
      setIdList((s) => [...s, newBlock.id]);
      setIdMap((s) => ({
        ...s,
        [newBlock.id]: newBlock,
      }));
    } else {
      setIdMap((s) => ({
        ...s,
        [newBlock.id]: newBlock,
      }));
      setIdList((s) => insert(s, index, newBlock.id));
    }
  };

  const updateBlockDataWithId = ({
    id,
    data,
  }: {
    id: string;
    data: any;
  }) => {
    setIdMap((s) => ({
      ...s,
      [id]: {
        ...s[id],
        data,
      },
    }));
  };

  const removeBlockWithId = ({ id }: { id: string }) => {
    setIdList((s) => s.filter((s) => s !== id));
  };

  const splitBlock = ({
    index,
    block,
    newBlock,
  }: {
    index: number;
    block: any;
    newBlock: any;
  }) => {
    insertBlock({ index: index + 1, block: newBlock });
    updateBlockDataWithId({
      id: block.id,
      data: block.data,
    });
  };

  const clear = (defaultValue?: any) => {
    const value = {
      type: 'paragraph',
      data: '',
      id: v4(),
    };
    setIdList(() => [value.id]);
    setIdMap(() => ({ [value.id]: value }));
  };

  return {
    // method
    findBlockIndexById,
    insertBlock,
    insertBlockAfter,
    splitBlock,
    updateBlockDataWithId,
    setIdMap,
    removeBlockWithId,
    clear,
    // data
    blockSelect,
    blockMap,
    hoverBlock,
    selectBlock,
    IdMap,
  };
}