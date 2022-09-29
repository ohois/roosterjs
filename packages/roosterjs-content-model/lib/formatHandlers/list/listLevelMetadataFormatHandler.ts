import { BulletListType, NumberingListType } from 'roosterjs-editor-types';
import { createMetadataFormatHandler } from '../utils/createMetadataFormatHandler';
import { FormatHandler } from '../FormatHandler';
import { ListMetadataFormat } from '../../publicTypes/format/formatParts/ListMetadataFormat';
import {
    createNumberDefinition,
    createObjectDefinition,
    getObjectKeys,
    getTagOfNode,
} from 'roosterjs-editor-dom';

/**
 * @internal
 */
export const OrderedMap: Record<NumberingListType, string> = {
    [NumberingListType.Decimal]: 'decimal',
    [NumberingListType.DecimalDash]: '"${Number}- "',
    [NumberingListType.DecimalParenthesis]: '"${Number}) "',
    [NumberingListType.DecimalDoubleParenthesis]: '"(${Number}) "',
    [NumberingListType.LowerAlpha]: 'lower-alpha',
    [NumberingListType.LowerAlphaDash]: '"${LowerAlpha}- "',
    [NumberingListType.LowerAlphaParenthesis]: '"${LowerAlpha}) "',
    [NumberingListType.LowerAlphaDoubleParenthesis]: '"(${LowerAlpha}) "',
    [NumberingListType.UpperAlpha]: '"${UpperAlpha}. "',
    [NumberingListType.UpperAlphaDash]: '"${UpperAlpha}- "',
    [NumberingListType.UpperAlphaParenthesis]: '"${UpperAlpha}) "',
    [NumberingListType.UpperAlphaDoubleParenthesis]: '"(${UpperAlpha}) "',
    [NumberingListType.LowerRoman]: 'lower-roman',
    [NumberingListType.LowerRomanDash]: '"${LowerRoman}- "',
    [NumberingListType.LowerRomanParenthesis]: '"${LowerRoman}) "',
    [NumberingListType.LowerRomanDoubleParenthesis]: '"(${LowerRoman}) "',
    [NumberingListType.UpperRoman]: '"${UpperRoman}. "',
    [NumberingListType.UpperRomanDash]: '"${UpperRoman}- "',
    [NumberingListType.UpperRomanParenthesis]: '"${UpperRoman}) "',
    [NumberingListType.UpperRomanDoubleParenthesis]: '"(${UpperRoman}) "',
};

/**
 * @internal
 */
export const UnorderedMap: Record<BulletListType, string> = {
    [BulletListType.Disc]: 'disc',
    [BulletListType.Square]: 'square',
    [BulletListType.Circle]: 'circle',
    [BulletListType.Dash]: '"- "',
    [BulletListType.LongArrow]: '"→ "',
    [BulletListType.DoubleLongArrow]: '"→ "',
    [BulletListType.ShortArrow]: '"➢ "',
    [BulletListType.UnfilledArrow]: '"➪ "',
    [BulletListType.Hyphen]: '"— "',
};
const ListStyleDefinitionMetadata = createObjectDefinition<ListMetadataFormat>(
    {
        orderedStyleType: createNumberDefinition(
            true /** isOptional */,
            undefined /** value **/,
            NumberingListType.Min,
            NumberingListType.Max
        ),
        unorderedStyleType: createNumberDefinition(
            true /** isOptional */,
            undefined /** value **/,
            BulletListType.Min,
            BulletListType.Max
        ),
    },
    true /** isOptional */,
    true /** allowNull */
);

const listMetadataFormatHandlerInternal = createMetadataFormatHandler<ListMetadataFormat>(
    ListStyleDefinitionMetadata,
    format => ({
        orderedStyleType: format.orderedStyleType,
        unorderedStyleType: format.unorderedStyleType,
    })
);

/**
 * @internal
 */
export const listLevelMetadataFormatHandler: FormatHandler<ListMetadataFormat> = {
    parse: (format, element, context, defaultStyle) => {
        const listStyle = element.style.listStyleType;
        const tag = getTagOfNode(element);

        listMetadataFormatHandlerInternal.parse(format, element, context, defaultStyle);

        if (listStyle) {
            if (tag == 'OL' && format.orderedStyleType === undefined) {
                const value = getKeyFromValue(OrderedMap, listStyle);
                format.orderedStyleType =
                    typeof value === 'undefined' ? undefined : parseInt(value);
            } else if (tag == 'UL' && format.unorderedStyleType === undefined) {
                const value = getKeyFromValue(UnorderedMap, listStyle);
                format.unorderedStyleType =
                    typeof value === 'undefined' ? undefined : parseInt(value);
            }
        }
    },
    apply: (format, element, context) => {
        const tag = getTagOfNode(element);

        listMetadataFormatHandlerInternal.apply(format, element, context);

        const listType =
            tag == 'OL'
                ? OrderedMap[format.orderedStyleType!]
                : UnorderedMap[format.unorderedStyleType!];

        if (listType && listType.indexOf('"') < 0) {
            element.style.listStyleType = listType;
        }
    },
};

function getKeyFromValue<K extends string | number, V>(
    map: Record<K, V>,
    value: V | undefined
): string | undefined {
    const result =
        value === undefined ? undefined : getObjectKeys(map).filter(key => map[key] == value)[0];

    // During run time the key is always string
    return (result as any) as string | undefined;
}