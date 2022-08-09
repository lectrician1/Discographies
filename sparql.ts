const sparqlKeywords = [
    'BASE',
    'PREFIX',
    'SELECT',
    'CONSTRUCT',
    'DESCRIBE',
    'ASK',
    'ORDER BY',
    'LIMIT',
    'ORDER BY',
    'FROM',
    'GRAPH', 'STR', 'isURI',
    'PREFIX',
    'CONSTRUCT',
    'LIMIT',
    'FROM NAMED',
    'OPTIONAL',
    'LANG',
    'isIRI',
    'DESCRIBE',
    'OFFSET',
    'WHERE', 'UNION',
    'LANGMATCHES',
    'isLITERAL',
    'ASK',
    'DISTINCT',
    'FILTER',
    'DATATYPE',
    'REGEX',
    'REDUCED',
    'a',
    'BOUND',
    'true',
    'sameTERM',
    'false'
]

class SparqlElement {
    query: string

    constructor(query: string) {
        this.query = query
    }

    toString(): string {
        return this.query
    }
}


class Query extends SparqlElement {
    constructor({ prologue, queryType }: QueryParameters) {
        super(`${prologue || ''}${queryType}`)
    }
}

interface QueryParameters {
    prologue?: Prologue,
    queryType: SelectQuery | ConstructQuery | DescribeQuery | AskQuery,
    ValuesClause: ValuesClause
}

// Repurpose UpdateUnit to take all of the updates
class UpdateUnit extends SparqlElement {
    constructor(updates: Update[]) {
        var query = updates.shift().toString()
        for (let update of updates) {
            query += `; ${update}`
        }
        super(query)
    }
}

class Prologue extends SparqlElement {
    constructor(bases: BaseDecl[], prefixes: PrefixDecl[]) {

        var query: string

        for (let base of bases) {
            query += `\n${base}`
        }

        for (let prefix of prefixes) {
            query += `\n${prefix}`
        }

        super(query + '\n')
    }
}

class BaseDecl extends SparqlElement {
    constructor(iri: IRIref) {
        super(`BASE ${iri}`)
    }
}

class PrefixDecl extends SparqlElement {
    constructor(pName: PNAME_NS, iri: IRIref) {
        super(`PREFIX ${pName} ${iri}`)
    }
}

class SelectQuery extends SparqlElement {
    constructor(
        selectClause: SelectClause,
        datasetClauses: DatasetClause[],
        whereClause: WhereClause,
        solutionModifier: SolutionModifier
    ) {
        var query = selectClause.toString()

        for (let datasetClause of datasetClauses) {
            query += ` ${datasetClause}`
        }

        super(`${query} ${whereClause} ${solutionModifier}`)
    }

}

class SubSelect extends SparqlElement {
    constructor(
        selectClause: SelectClause,
        whereClause: WhereClause,
        solutionModifier: SolutionModifier,
        valuesClause: ValuesClause
    ) {
        super(`${selectClause} ${whereClause} ${solutionModifier} ${valuesClause}`)
    }
}

class SelectClause extends SparqlElement {
    constructor(selectors?: Selector[], option?: 'DISTINCT' | 'REDUCED') {
        var query = `SELECT ${option}`

        if (selectors) {
            for (let selector of selectors) {
                query += ` ${selector}`
            }
        }
        else query += ' *'

        super(query)
    }
}

// Extension of SelectClause
class Selector extends SparqlElement {
    constructor(varElement: Var, expression?: Expression) {
        var query: string

        if (expression) {
            query = `( ${expression} AS ${varElement} )`
        }
        else query = varElement.toString()

        super(query)
    }
}

class ConstructQuery extends SparqlElement {
    constructor(constructType: Construct1 | Construct2) {
        super(`CONSTRUCT ${constructType}`)
    }
}

// Extension of ConstructQuery
class Construct1 extends SparqlElement {
    constructor(
        constructTemplate: ConstructTemplate,
        datasetClauses: DatasetClause[],
        whereClause: WhereClause,
        solutionModifier: SolutionModifier
    ) {
        var query = constructTemplate.toString()

        for (let datasetClause of datasetClauses) {
            query += ` ${datasetClause}`
        }

        super(`${query} ${whereClause} ${solutionModifier}`)
    }
}

// Extension of ConstructQuery
class Construct2 extends SparqlElement {
    constructor(
        datasetClauses: DatasetClause[],
        triples: TriplesSameSubject[],
        solutionModifier: SolutionModifier
    ) {
        var query: string

        for (let datasetClause of datasetClauses) {
            query += `${datasetClause} `
        }

        query += 'WHERE { '

        for (let triple of triples) {
            query += `${triple} `
        }

        super(`${query}} ${solutionModifier}`)
    }
}

class DescribeQuery extends SparqlElement {
    constructor(
        vars: VarOrIRIRef[],
        datasetClauses: DatasetClause[],
        solutionModifier: SolutionModifier,
        whereClause?: WhereClause
    ) {
        var query = 'DESCRIBE '

        if (vars.length > 0) {
            for (let varElement of vars) {
                query += `${varElement} `
            }
        }
        else query += '* '

        for (let datasetClause of datasetClauses) {
            query += `${datasetClause} `
        }

        super(`${query} ${whereClause ? whereClause : ''} ${solutionModifier}`)
    }
}

class AskQuery extends SparqlElement {
    constructor(
        datasetClauses: DatasetClause[], 
        whereClause: WhereClause, 
        solutionModifier: SolutionModifier
    ) {
        var query = 'ASK '

        for (let datasetClause of datasetClauses) {
            query += `${datasetClause} `
        }

        super(`${query} ${whereClause} ${solutionModifier}`)
    }
}

class DatasetClause extends SparqlElement {
    constructor(iri: IRI, named: boolean) {
        super(`FROM ${named ? 'NAMED ' : ''}${iri}`)
    }
}
// DefaultGraphClause, NamedGraphClause, SourceSelector handled by DatasetClause

class WhereClause extends SparqlElement {
    constructor(groupGraphPattern: GroupGraphPattern) {
        super(`WHERE ${groupGraphPattern}`)
    }
}

class SolutionModifier extends SparqlElement {
    constructor(
        groupClause?: GroupClause, 
        havingClause?: HavingClause, 
        orderClause?: OrderClause, 
        limitOffsetClauses?: LimitOffsetClauses
    ) {
        super(`${groupClause} ${havingClause} ${orderClause} ${limitOffsetClauses}`)
    }
}

class GroupClause extends SparqlElement {
    constructor(groupCondition1: groupConditions: GroupCondition[]) {
        var query = 'GROUP BY '
    } 
}

class ValuesClause extends SparqlElement {
    constructor(dataBlock: DataBlock) {
        super(`VALUES ${dataBlock}`)
    }
}

class Update extends SparqlElement {
    constructor(prologue: Prologue, update?: Update1) {
        super(`${prologue} ${update}`)
    }
}

type Update1 = Load | Clear | Drop | Add | Move | Copy | Create | InsertData | DeleteData | DeleteWhere | Modify

class Load extends SparqlElement {
    constructor(silent: boolean, iri: IRI, graphRef?: GraphRef) {
        super(`LOAD ${silent ? 'SILENT ' : ''}${iri}${graphRef ? ` INTO ${graphRef}` : ''}`)
    }
}

class Clear extends SparqlElement {
    constructor(silent: boolean, graphRefAll: GraphRefAll) {
        super(`CLEAR ${silent ? 'SILENT ' : ''}${graphRefAll}`)
    }
}

class Drop extends SparqlElement {
    constructor(silent: boolean, graphRefAll: GraphRefAll) {
        super(`DROP ${silent ? 'SILENT ' : ''}${graphRefAll}`)
    }
}

class Create extends SparqlElement {
    constructor(silent: boolean, graphRefAll: GraphRef) {
        super(`CREATE ${silent ? 'SILENT ' : ''}${graphRefAll}`)
    }
}

class Add extends SparqlElement {
    constructor(silent: boolean, graph1: GraphOrDefault, graph2: GraphOrDefault) {
        super(`ADD ${silent ? 'SILENT ' : ''}${graph1} TO ${graph2}`)
    }
}

class Move extends SparqlElement {
    constructor(silent: boolean, graph1: GraphOrDefault, graph2: GraphOrDefault) {
        super(`MOVE ${silent ? 'SILENT ' : ''}${graph1} TO ${graph2}`)
    }
}

class Copy extends SparqlElement {
    constructor(silent: boolean, graph1: GraphOrDefault, graph2: GraphOrDefault) {
        super(`COPY ${silent ? 'SILENT ' : ''}${graph1} TO ${graph2}`)
    }
}

class InsertData extends SparqlElement {
    constructor(quadData: QuadData) {
        super(`INSERT DATA ${quadData}`)
    }
}

class DeleteData extends SparqlElement {
    constructor(quadData: QuadData) {
        super(`DELETE DATA ${quadData}`)
    }
}

class DeleteWhere extends SparqlElement {
    constructor(quadData: QuadData) {
        super(`DELETE WHERE ${quadData}`)
    }
}

class Modify extends SparqlElement {
    constructor(
        insertClause: InsertClause,
        usingClauses: UsingClause[],
        pattern: GroupGraphPattern,
        iri?: IRI,
        deleteCaluse?: DeleteClause
    ) {
        var query = `${iri ? `WITH ${iri} ` : ''}${deleteCaluse ? `${deleteCaluse} ` : ''}${insertClause}`

        for (let usingClause of usingClauses) {
            query += ` ${usingClause}`
        }

        query += ` WHERE ${pattern}`

        super(query)
    }
}

class DeleteClause extends SparqlElement {
    constructor(quadPattern: QuadPattern) {
        super(`DELETE ${quadPattern}`)
    }
}

class InsertClause extends SparqlElement {
    constructor(quadPattern: QuadPattern) {
        super(`INSERT ${quadPattern}`)
    }
}

class UsingClause extends SparqlElement {
    constructor(iri: IRI, named: boolean) {
        super(`USING ${named ? 'NAMED ' : ''}${iri}`)
    }
}

class GraphOrDefault extends SparqlElement {
    constructor(graphType: 'DEFAULT' | GraphWithIRI) {
        super(graphType.toString())
    }
}

class GraphWithIRI extends SparqlElement {
    constructor(graph: boolean, iri: IRI) {
        super(`${graph ? 'GRAPH ' : ''}${iri}`)
    }
}

class GraphRef extends SparqlElement {
    constructor(iri: IRI) {
        super(`GRAPH ${iri}`)
    }
}

type GraphRefAll = GraphRef | 'DEFAULT' | 'NAMED' | 'ALL'

class QuadPattern extends SparqlElement {
    constructor(quads: Quads) {
        super(`{ ${quads} }`)
    }
}

type QuadData = QuadPattern

class Quads extends SparqlElement {
    constructor(triples: TriplesSameSubject[]
}

class DataBlock extends SparqlElement {
    constructor(vars: Var[], dataBlockValues: DataBlockValue[]) {
        var varsQuery: string
        for (let varElement of vars) {
            varsQuery += `${varElement} `
        }

        varsQuery = `( ${query}) `

        var dataBlockValuesQuery: string
        for (let dataBlockValue of dataBlockValues) {
            dataBlockValuesQuery += `${dataBlockValue}\n`
        }

        dataBlockValuesQuery = `{\n${dataBlockValuesQuery}}`

        super(varsQuery + dataBlockValuesQuery)
    }
}

type DataBlockValue = IRI | RDFLiteral | NumericLiteral | BooleanLiteral | 'UNDEF'

class MinusGraphPattern extends SparqlElement {
    constructor(groupGraphPattern: GroupGraphPattern) {
        super(`MINUS ${groupGraphPattern}`)
    }
}

class GroupOrUnionGraphPattern extends SparqlElement {
    constructor(pattern: GroupGraphPattern, unionPattern?: GroupGraphPattern) {
        super(`${pattern}${unionPattern ? ` UNION ${unionPattern}` : ''}`)
    }
}

class Filter extends SparqlElement {
    constructor(constraint: Constraint) {
        super(`FILTER ${constraint}`)
    }
}

type Constraint = BrackettedExpression | BuiltInCall | FunctionCall

class FunctionCall extends SparqlElement {
    constructor(iriRef: IRIref, argList: ArgList) {
        super(`${iriRef} ${argList}`)
    }
}

class ArgList extends SparqlElement {
    constructor(
        argList: NIL | ArgListFilled
    ) {
        super(argList.toString())
    }
}

class ArgListFilled extends SparqlElement {
    constructor(
        distinct: boolean,
        expression1: Expression,
        expressions?: Expression[]
    ) {
        var query = (distinct ? 'DISTINCT' : '') + expression1.toString()
        for (var expression of expressions) {
            query += `, ${expression}`
        }
        super(`( ${query} )`)
    }
}

class ExpressionList extends SparqlElement {
    constructor(
        expressionList: NIL | ExpressionListFilled
    ) {
        super(expressionList.toString())
    }
}

class ExpressionListFilled extends SparqlElement {
    constructor(
        expression1: Expression,
        expressions?: Expression[]
    ) {
        var query = expression1.toString()
        for (var expression of expressions) {
            query += `, ${expression}`
        }
        super(`( ${query} )`)
    }
}

class ConstructTemplate extends SparqlElement {
    constructor(
        constructTriples?: TriplesSameSubject[]
    ) {
        var query: string
        if (constructTriples.length > 0) {
            query = constructTriples.shift().toString()
            for (var expression of constructTriples) {
                query += `.\n${expression}`
            }
        }
        super(`{ ${query} }`)
    }
}

// ConstructTemplate accounts for ConstructTriples


class TriplesSameSubject extends SparqlElement {
    constructor()
}

class IRI {
    iri: string
    constructor(iri: string) {
        this.iri = `<${iri}>`
    }

    toString() {
        return this.iri
    }
}

function PN_PREFIX(prefix: string): string {
    var varchars = prefix.split('')
    var firstChar = varchars.shift()
    if (!PN_CHARS_BASE(firstChar))
        throw 'first char not valid'
    if (varchars.length > 0) {
        var lastChar = varchars.pop()
        if (!PN_CHARS(lastChar))
            throw 'last char not valid'
    }
    for (let i = 0; i < varchars.length; i++) {
        if (!PN_CHARS(firstChar) && firstChar !== '.')
            throw `char index ${i + 1} is not valid`
    }
    return prefix
}

function PN_CHARS_BASE(base: string): boolean {
    let pattern = /[A-Z]|[a-z]|[\u00c0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]/

    return pattern.test(base)
}

function PN_CHARS(char: string): boolean {
    return PN_CHARS_U(char) || /-|[0-9]|\u0087|[\u0300-\u036F]|[\u203F-\u2040]/.test(char)
}

function PN_CHARS_U(char: string): boolean {
    return PN_CHARS_BASE(char) || char == '_'
}

class GroupGraphPattern extends SparqlElement {
    constructor(triplesBlock: TriplesBlock, extraTriplesBlocks?: ExtraTriplesBlock[]) {
        var query = triplesBlock.toString()
        if (extraTriplesBlocks) {
            for (let extraTriplesBlock of extraTriplesBlocks) {
                query += `.\n${extraTriplesBlock}`
            }
        }

        super(`{\n  ${query}\n}`)
    }
}

class ExtraTriplesBlock extends SparqlElement {
    constructor(start?: GraphPatternNotTriples | Filter, triplesBlock?: TriplesBlock) {
        var query: string
        if (start) {
            query += start.toString() + '. '
        }
        super(query + triplesBlock.toString())
    }
}

class BrackettedExpression extends SparqlElement {
    constructor(expression: Expression) {
        super(`( ${expression} )`)
    }
}

class Expression extends SparqlElement {
    constructor(orExpression: ConditionalOrExpression) {
        super(orExpression.toString())
    }
}

class ConditionalOrExpression extends SparqlElement {
    constructor(andExpressions: ConditionalAndExpression[]) {
        if (andExpressions.length > 0) {
            var query = andExpressions.shift().toString()
            for (var andExpression of andExpressions) {
                query += ` || ${andExpression}`
            }
            super(query)
        }
        else throw 'andExpressions must have a length at least 1'
    }
}

class ConditionalAndExpression extends SparqlElement {
    constructor(valueLogicals: ValueLogical[]) {
        if (valueLogicals.length > 0) {
            var query = valueLogicals.shift().toString()
            for (var valueLogical of valueLogicals) {
                query += ` && ${valueLogical}`
            }
            super(query)
        }
        else throw 'valueLogicals must have a length at least 1'
    }
}

class ValueLogical extends SparqlElement {
    constructor(
        comparator1: AdditiveExpression,
        comparison: '=' | '!=' | '<' | '>' | '<=' | '>=',
        comparator2: AdditiveExpression) {
        super(`${comparator1} ${comparison} ${comparator2}`)
    }
}

class AdditiveExpression extends SparqlElement {
    constructor(
        addative1: MultiplicativeExpression,
        addatives: Addative[]
    ) {
        var query: string = addative1.toString()
        for (let addative of addatives) {
            query += ` ${addative}`
        }
        super(query)
    }
}

class Addative extends SparqlElement {
    constructor(
        operator: '+' | '-',
        addative: MultiplicativeExpression | Number
    ) {
        super(`${operator} ${addative.toString()}`)
    }
}

class MultiplicativeExpression extends SparqlElement {
    constructor(
        expression1: UnaryExpression,
        expressions: Multiplier[]
    ) {
        var query: string = expression1.toString()
        for (let expression of expressions) {
            query += ` ${expression}`
        }
        super(query)
    }
}

class Multiplier extends SparqlElement {
    constructor(
        operator: '*' | '/',
        multiplier: UnaryExpression
    ) {
        super(`${operator} ${multiplier}`)
    }
}

class UnaryExpression extends SparqlElement {
    constructor(
        expression: BrackettedExpression |
            BuiltInCall |
            IRIrefOrFunction |
            RDFLiteral |
            NumericLiteral |
            BooleanLiteral |
            Var,
        operator?: '!' | '+' | '-'
    ) {
        super(`${operator}${expression}`)
    }
}

class IRIrefOrFunction extends SparqlElement {
    constructor(
        iriRef: IRIref,
        argList?: ArgList
    ) {
        super(`${iriRef}${argList}`)
    }
}

class BuiltInCall extends SparqlElement {
    constructor(
        call: Aggregate |
            StringCall |
            LangCall |
            LangMatchesCall |
            DataTypeCall |
            BoundCall |
            IRICall |
            URICall |
            BNODECall |
            RANDCall |
            ABSCall |
            CEILCall |
            FLOORCall |
            ROUNDCall |
            CONCATCall |
            STRLENCall |
            UCASECall |
            LCASECall |
            ENCODE_FOR_URICall |
            CONTAINSCall |
            STRSTARSCall |
            STRENDSCall |
            STRBEFORECall |
            STRAFTERCall |
            YEARCall |
            MONTHCall |
            DAYCall |
            HOURSCall |
            MINUTESCall |
            SECONDSCall |
            TIMEZONECall |
            TZCall |
            NOWCall |
            UUIDCall |
            STRUUIDCall |
            MDSCall |
            SHA1Call |
            SHA256Call |
            SHA384Call |
            SHA512Call |
            COALESCECall |
            IFCall |
            STRLANGCall |
            STRDTCall |
            SameTermCall |
            IsIRICall |
            IsURICall |
            IsBlankCall |
            IsLiteralCall |
            IsNUMERICCall |
            RegexExpression |
            ExistsFunc |
            NotExistsFunc |
    ) {
        super(call.toString())
    }
}



class StringCall extends SparqlElement {
    constructor(expression: Expression) {
        super(`STR (${expression})`)
    }
}

class LangCall extends SparqlElement {
    constructor(expression: Expression) {
        super(`LANG (${expression})`)
    }
}

class LangMatchesCall extends SparqlElement {
    constructor(expression1: Expression, expression2: Expression) {
        super(`LANGMATCHES (${expression1}, ${expression2})`)
    }
}

class DataTypeCall extends SparqlElement {
    constructor(expression: Expression) {
        super(`DATATYPE (${expression})`)
    }
}

class BoundCall extends SparqlElement {
    constructor(varParameter: Var) {
        super(`BOUND (${varParameter})`)
    }
}

class COALESCECall extends SparqlElement {
    constructor(expressionList: ExpressionList) {
        super(`COALESCE (${expressionList.toString()})`)
    }
}

class IFCall extends SparqlElement {
    constructor(
        expression1: Expression,
        expression2: Expression,
        expression3: Expression
    ) {
        super(`IF (${expression1}, ${expression2}, ${expression3})`)
    }
}

class STRLANGCall extends SparqlElement {
    constructor(expression1: Expression, expression2: Expression) {
        super(`STRLANG (${expression1}, ${expression2})`)
    }
}

class STRDTCall extends SparqlElement {
    constructor(expression1: Expression, expression2: Expression) {
        super(`STRDT (${expression1}, ${expression2})`)
    }
}

class SameTermCall extends SparqlElement {
    constructor(expression1: Expression, expression2: Expression) {
        super(`sameTerm (${expression1}, ${expression2})`)
    }
}

class IsIRICall extends SparqlElement {
    constructor(expression: Expression) {
        super(`isIRI (${expression})`)
    }
}

class IsURICall extends SparqlElement {
    constructor(expression: Expression) {
        super(`isURI (${expression})`)
    }
}

class IsBlankCall extends SparqlElement {
    constructor(expression: Expression) {
        super(`isBLANK (${expression})`)
    }
}

class IsLiteralCall extends SparqlElement {
    constructor(expression: Expression) {
        super(`isLITERAL (${expression})`)
    }
}

class IsNUMERICCall extends SparqlElement {
    constructor(expression: Expression) {
        super(`isNUMERIC (${expression})`)
    }
}

class RegexExpression extends SparqlElement {
    constructor(
        expression1: Expression,
        expression2: Expression,
        expression3?: Expression
    ) {
        super(`REGEX (${expression1}, ${expression2}${expression3 ? `, ${expression3}` : ``})`)
    }
}

class SubstringExpression extends SparqlElement {
    constructor(
        expression1: Expression,
        expression2: Expression,
        expression3?: Expression
    ) {
        super(`SUBSTR (${expression1}, ${expression2}${expression3 ? `, ${expression3}` : ``})`)
    }
}

class StrReplaceExpression extends SparqlElement {
    constructor(
        expression1: Expression,
        expression2: Expression,
        expression3: Expression,
        expression4?: Expression
    ) {
        super(`REPLACE (${expression1}, ${expression2}, ${expression3}${expression4 ? `, ${expression4}` : ``})`)
    }
}

class ExistsFunc extends SparqlElement {
    constructor(groupGraphPattern: GroupGraphPattern) {
        super(`EXISTS ${groupGraphPattern.toString()}`)
    }
}

class NotExistsFunc extends SparqlElement {
    constructor(groupGraphPattern: GroupGraphPattern) {
        super(`NOT EXISTS ${groupGraphPattern.toString()}`)
    }
}

type GraphPatternNotTriples = OptionalGraphPattern | GroupOrUnionGraphPattern | GraphGraphPattern

class OptionalGraphPattern extends SparqlElement {
    constructor(pattern: GroupGraphPattern) {
        super(`OPTIONAL ${pattern}`)
    }
}

type VarOrIRIRef = Var | IRIref

class GraphGraphPattern extends SparqlElement {
    constructor(varOrIRIRef: VarOrIRIRef, pattern: GroupGraphPattern) {
        super(`GRAPH ${varOrIRIRef} ${pattern}`)
    }
}

class TriplesBlock extends SparqlElement {
    constructor(subject: VarSubject | NodeSubject) {
        super(subject.toString())
    }
}

class VarSubject extends SparqlElement {
    constructor(varOrTerm: VarOrTerm, propertyList: PropertyListNotEmpty) {
        super(`${varOrTerm} ${propertyList}`)
    }
}

type VarOrTerm = Var | GraphTerm

type Var = Var1 | Var2

function checkVarName(varname: string): string {
    var varchars = varname.split('')
    var firstChar = varchars.shift()
    if (!PN_CHARS_U(firstChar) && !/[0-9]/.test(firstChar)) throw 'first char not valid'
    for (let i = 0; i < varchars.length; i++) {
        if (!PN_CHARS_U(firstChar) && !/[0-9]|\u0087|[\u0300-\u036F]|[\u203F-\u2040]/.test(firstChar))
            throw `char index ${i + 1} is not valid`
    }
    return varname
}

/**
 * ?
 */
class Var1 extends SparqlElement {
    constructor(varname: string) {
        super(`?${checkVarName(varname)}`)
    }
}

/**
 * $
 */
class Var2 extends SparqlElement {
    constructor(varname: string) {
        super(`$${checkVarName(varname)}`)
    }
}



type GraphTerm = IRIref | RDFLiteral | NumericLiteral | BooleanLiteral | BlankNode | NIL

type IRIref = IRI | PrefixedName

type PrefixedName = PNAME_LN | PNAME_NS

/**
 * name:thing
 */
class PNAME_LN extends SparqlElement {
    constructor(prefix: string, local: string) {
        super(`${new PNAME_NS(prefix)}${PN_LOCAL(local)}`)
    }
}

/**
 * name:
 */
class PNAME_NS extends SparqlElement {
    constructor(prefix: string) {
        super(`${PN_PREFIX(prefix)}:`)
    }
}

function PN_LOCAL(name: string): string {
    var varchars = name.split('')
    var firstChar = varchars.shift()
    if (!PN_CHARS_U(firstChar) && !/[0-9]/.test(firstChar))
        throw 'first char not valid'
    if (varchars.length > 0) {
        var lastChar = varchars.pop()
        if (!PN_CHARS(lastChar))
            throw 'last char not valid'
    }
    for (let i = 0; i < varchars.length; i++) {
        if (!PN_CHARS(firstChar) && firstChar !== '.')
            throw `char index ${i + 1} is not valid`
    }
    return name
}


// Escape characters
function PN_LOCAL_ESC(name: string): string {

}

function PERCENT(name: string): string {

}

type Aggregate = CountAggregate |
    SumAggregate |
    MinAggregate |
    MaxAggregate |
    AvgAggregate |
    SampleAggregate |
    Group_ConcatAggregate

class CountAggregate extends SparqlElement {
    constructor(expression: Expression | '*', distinct?: boolean) {
        super(`COUNT ( ${distinct ? 'DISTINCT ' : ''}${expression.toString()} )`)
    }
}

class SumAggregate extends SparqlElement {
    constructor(expression: Expression | '*', distinct?: boolean) {
        super(`SUM ( ${distinct ? 'DISTINCT ' : ''}${expression.toString()} )`)
    }
}

class MinAggregate extends SparqlElement {
    constructor(expression: Expression | '*', distinct?: boolean) {
        super(`MIN ( ${distinct ? 'DISTINCT ' : ''}${expression.toString()} )`)
    }
}

class MaxAggregate extends SparqlElement {
    constructor(expression: Expression | '*', distinct?: boolean) {
        super(`MAX ( ${distinct ? 'DISTINCT ' : ''}${expression.toString()} )`)
    }
}

class AvgAggregate extends SparqlElement {
    constructor(expression: Expression | '*', distinct?: boolean) {
        super(`AVG ( ${distinct ? 'DISTINCT ' : ''}${expression.toString()} )`)
    }
}

class SampleAggregate extends SparqlElement {
    constructor(expression: Expression | '*', distinct?: boolean) {
        super(`SAMPLE ( ${distinct ? 'DISTINCT ' : ''}${expression.toString()} )`)
    }
}

class Group_ConcatAggregate extends SparqlElement {
    constructor(expression: Expression | '*', distinct?: boolean, seperator?: string) {
        super(`GROUP_CONCAT ( ${distinct ? 'DISTINCT ' : ''}${expression.toString()}${seperator ? `; SEPARATOR = ${SparqlString(seperator)}` : ``} )`)
    }
}

function SparqlString(input: string): string {

}

class RDFLiteral extends SparqlElement {
    constructor(name: string) {
        super(name)
    }
}

class NumericLiteral extends SparqlElement {
    constructor(num: number) {
        super(num.toString())
    }
}

class BooleanLiteral extends SparqlElement {
    constructor(bool: boolean) {
        super(bool.toString())
    }
}

class BlankNode extends SparqlElement {
    constructor(node: BLANK_NODE_LABEL | ANON) {
        super(node.toString())
    }
}

class BLANK_NODE_LABEL extends SparqlElement {
    constructor(label: string) {
        super(`_: ${PN_LOCAL(label)}`)
    }
}

class ANON extends SparqlElement {
    constructor(name: string) {
        super(`[ ${name} ]`)
    }
}

class NIL extends SparqlElement {
    constructor(name: string) {
        super(`( ${name} )`)
    }
}

class NodeSubject extends SparqlElement {
    constructor(triplesNode: TriplesNode, propertyList?: PropertyListNotEmpty) {
        super(`${triplesNode} ${propertyList}`)
    }
}

type TriplesNode = Collection | BlankNodePropertyList;

class Collection extends SparqlElement {
    constructor(graphNodes: GraphNode[]) {
        if (graphNodes.length > 0) {
            var query: string
            for (var graphNode of graphNodes) {
                query += graphNode

                super(query)
            }
        }
        else throw 'graphNodes must be longer than 0'
    }
}

class BlankNodePropertyList extends SparqlElement {
    constructor(propertyList: PropertyListNotEmpty) {
        super(`[ ${propertyList} ]`)
    }
}

class PropertyListNotEmpty extends SparqlElement {
    constructor(verbObjectLists: VerbObjectList[]) {
        var query = verbObjectLists.shift().toString()
        for (let verbObjectList of verbObjectLists) {
            query += `; ${verbObjectList}`
        }

        super(`${query}`)
    }
}

class VerbObjectList extends SparqlElement {
    constructor(verb: Verb, objectList: ObjectList) {
        super(`${verb} ${objectList}`)
    }
}

class Verb extends SparqlElement {
    constructor(verb: VarOrIRIRef | 'a') {
        super(verb.toString())
    }
}

class ObjectList extends SparqlElement {
    constructor(objects: GraphNode[]) {
        var query = objects.shift().toString()
        for (let object of objects) {
            query += `, ${object}`
        }
        super(query)
    }
}

type GraphNode = VarOrTerm | TriplesNode

class Distinct extends SolutionModifier {
    toString(): string {
        return 'DISTINCT '
    }
}

class Reduced extends SolutionModifier {
    toString(): string {
        return 'REDUCED '
    }
}

class SparqlParams {

}

class SparqlSelector {
    name: string
    constructor(name: string) {
        this.name = name
    }
}



class wdt {
    id: string
    constructor(id: string) {
        this.id = id
    }
}

class wd {
    id: string
    constructor(id: string) {
        this.id = id
    }
}

`SELECT ?release ?performer WHERE {
    ?release wdt:P31 ?performer.
  }`


var release = new Var1('release'),
    performer = new Var1('performer');

var query = new Query({
    queryType: new SelectQuery({
        vars: [release, performer],
        clause: new WhereClause(
            new GroupGraphPattern(
                new TriplesBlock(
                    new VarSubject(
                        release,
                        new PropertyListNotEmpty([
                            new VerbObjectList(
                                new Verb(
                                    new PNAME_LN('wdt', 'P31')
                                ),
                                new ObjectList([
                                    performer
                                ])
                            )
                        ])
                    )
                )
            )
        )
    })
})

console.log(query.toString())