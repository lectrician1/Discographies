var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var sparqlKeywords = [
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
];
var SparqlElement = /** @class */ (function () {
    function SparqlElement(query) {
        this.query = query;
    }
    SparqlElement.prototype.toString = function () {
        return this.query;
    };
    return SparqlElement;
}());
var Query = /** @class */ (function (_super) {
    __extends(Query, _super);
    function Query(_a) {
        var prologue = _a.prologue, queryType = _a.queryType;
        return _super.call(this, "".concat(prologue || '').concat(queryType)) || this;
    }
    return Query;
}(SparqlElement));
var SelectQuery = /** @class */ (function (_super) {
    __extends(SelectQuery, _super);
    function SelectQuery(_a) {
        var preSolutionModifier = _a.preSolutionModifier, vars = _a.vars, clause = _a.clause, solutionModifier = _a.solutionModifier;
        return _super.call(this, "SELECT ".concat(preSolutionModifier || '').concat(vars.toString().replace(',', ' '), " ").concat(clause, " ").concat(solutionModifier || '')) || this;
    }
    return SelectQuery;
}(SparqlElement));
var Prologue = /** @class */ (function (_super) {
    __extends(Prologue, _super);
    function Prologue(base, prefixes) {
        var query = "".concat(base, " ");
        for (var _i = 0, prefixes_1 = prefixes; _i < prefixes_1.length; _i++) {
            var prefix = prefixes_1[_i];
            query += "".concat(prefix, " ");
        }
        return _super.call(this, query) || this;
    }
    return Prologue;
}(SparqlElement));
var BaseDecl = /** @class */ (function (_super) {
    __extends(BaseDecl, _super);
    function BaseDecl(iri) {
        return _super.call(this, "BASE ".concat(iri)) || this;
    }
    return BaseDecl;
}(SparqlElement));
var IRI = /** @class */ (function () {
    function IRI(iri) {
        this.iri = "<".concat(iri, ">");
    }
    IRI.prototype.toString = function () {
        return this.iri;
    };
    return IRI;
}());
function PN_PREFIX(prefix) {
    var varchars = prefix.split('');
    var firstChar = varchars.shift();
    if (!PN_CHARS_BASE(firstChar))
        throw 'first char not valid';
    if (varchars.length > 0) {
        var lastChar = varchars.pop();
        if (!PN_CHARS(lastChar))
            throw 'last char not valid';
    }
    for (var i = 0; i < varchars.length; i++) {
        if (!PN_CHARS(firstChar) && firstChar !== '.')
            throw "char index ".concat(i + 1, " is not valid");
    }
    return prefix;
}
function PN_CHARS_BASE(base) {
    var pattern = /[A-Z]|[a-z]|[\u00c0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]/;
    return pattern.test(base);
}
function PN_CHARS(char) {
    return PN_CHARS_U(char) || /-|[0-9]|\u0087|[\u0300-\u036F]|[\u203F-\u2040]/.test(char);
}
function PN_CHARS_U(char) {
    return PN_CHARS_BASE(char) || char == '_';
}
var PrefixDecl = /** @class */ (function (_super) {
    __extends(PrefixDecl, _super);
    function PrefixDecl(pName, iri) {
        return _super.call(this, "PREFIX ".concat(pName, " ").concat(iri)) || this;
    }
    return PrefixDecl;
}(SparqlElement));
var AskQuery = /** @class */ (function (_super) {
    __extends(AskQuery, _super);
    function AskQuery(pName, iri) {
        return _super.call(this, "PREFIX ".concat(pName, " ").concat(iri)) || this;
    }
    return AskQuery;
}(SparqlElement));
var ConstructQuery = /** @class */ (function (_super) {
    __extends(ConstructQuery, _super);
    function ConstructQuery() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConstructQuery;
}(SparqlElement));
var DescribeQuery = /** @class */ (function (_super) {
    __extends(DescribeQuery, _super);
    function DescribeQuery() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DescribeQuery;
}(SparqlElement));
var WhereClause = /** @class */ (function (_super) {
    __extends(WhereClause, _super);
    function WhereClause(groupGraphPattern) {
        return _super.call(this, "WHERE ".concat(groupGraphPattern)) || this;
    }
    return WhereClause;
}(SparqlElement));
var DatasetClause = /** @class */ (function (_super) {
    __extends(DatasetClause, _super);
    function DatasetClause() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DatasetClause;
}(SparqlElement));
var SolutionModifier = /** @class */ (function (_super) {
    __extends(SolutionModifier, _super);
    function SolutionModifier() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SolutionModifier;
}(SparqlElement));
var GroupGraphPattern = /** @class */ (function (_super) {
    __extends(GroupGraphPattern, _super);
    function GroupGraphPattern(triplesBlock, extraTriplesBlocks) {
        var query = triplesBlock.toString();
        if (extraTriplesBlocks) {
            for (var _i = 0, extraTriplesBlocks_1 = extraTriplesBlocks; _i < extraTriplesBlocks_1.length; _i++) {
                var extraTriplesBlock = extraTriplesBlocks_1[_i];
                query += ".\n".concat(extraTriplesBlock);
            }
        }
        return _super.call(this, "{\n  ".concat(query, "\n}")) || this;
    }
    return GroupGraphPattern;
}(SparqlElement));
var ExtraTriplesBlock = /** @class */ (function (_super) {
    __extends(ExtraTriplesBlock, _super);
    function ExtraTriplesBlock(start, triplesBlock) {
        var query;
        if (start) {
            query += start.toString() + '. ';
        }
        return _super.call(this, query + triplesBlock.toString()) || this;
    }
    return ExtraTriplesBlock;
}(SparqlElement));
var Filter = /** @class */ (function (_super) {
    __extends(Filter, _super);
    function Filter(constraint) {
        return _super.call(this, "FILTER ".concat(constraint)) || this;
    }
    return Filter;
}(SparqlElement));
var BrackettedExpression = /** @class */ (function (_super) {
    __extends(BrackettedExpression, _super);
    function BrackettedExpression(expression) {
        return _super.call(this, "( ".concat(expression, " )")) || this;
    }
    return BrackettedExpression;
}(SparqlElement));
var Expression = /** @class */ (function (_super) {
    __extends(Expression, _super);
    function Expression(orExpression) {
        return _super.call(this, orExpression.toString()) || this;
    }
    return Expression;
}(SparqlElement));
var ConditionalOrExpression = /** @class */ (function (_super) {
    __extends(ConditionalOrExpression, _super);
    function ConditionalOrExpression(andExpressions) {
        var _this = this;
        if (andExpressions.length > 0) {
            var query = andExpressions.shift().toString();
            for (var _i = 0, andExpressions_1 = andExpressions; _i < andExpressions_1.length; _i++) {
                var andExpression = andExpressions_1[_i];
                query += " || ".concat(andExpression);
            }
            _this = _super.call(this, query) || this;
        }
        else
            throw 'andExpressions must have a length at least 1';
        return _this;
    }
    return ConditionalOrExpression;
}(SparqlElement));
var ConditionalAndExpression = /** @class */ (function (_super) {
    __extends(ConditionalAndExpression, _super);
    function ConditionalAndExpression(valueLogicals) {
        var _this = this;
        if (valueLogicals.length > 0) {
            var query = valueLogicals.shift().toString();
            for (var _i = 0, valueLogicals_1 = valueLogicals; _i < valueLogicals_1.length; _i++) {
                var valueLogical = valueLogicals_1[_i];
                query += " && ".concat(valueLogical);
            }
            _this = _super.call(this, query) || this;
        }
        else
            throw 'valueLogicals must have a length at least 1';
        return _this;
    }
    return ConditionalAndExpression;
}(SparqlElement));
var ValueLogical = /** @class */ (function (_super) {
    __extends(ValueLogical, _super);
    function ValueLogical(comparator1, comparison, comparator2) {
        return _super.call(this, "".concat(comparator1, " ").concat(comparison, " ").concat(comparator2)) || this;
    }
    return ValueLogical;
}(SparqlElement));
var AdditiveExpression = /** @class */ (function (_super) {
    __extends(AdditiveExpression, _super);
    function AdditiveExpression(addative1, addatives) {
        var query = addative1.toString();
        for (var _i = 0, addatives_1 = addatives; _i < addatives_1.length; _i++) {
            var addative = addatives_1[_i];
            query += " ".concat(addative);
        }
        return _super.call(this, query) || this;
    }
    return AdditiveExpression;
}(SparqlElement));
var Addative = /** @class */ (function (_super) {
    __extends(Addative, _super);
    function Addative(operator, addative) {
        return _super.call(this, "".concat(operator, " ").concat(addative.toString())) || this;
    }
    return Addative;
}(SparqlElement));
var MultiplicativeExpression = /** @class */ (function (_super) {
    __extends(MultiplicativeExpression, _super);
    function MultiplicativeExpression(expression1, expressions) {
        var query = expression1.toString();
        for (var _i = 0, expressions_1 = expressions; _i < expressions_1.length; _i++) {
            var expression = expressions_1[_i];
            query += " ".concat(expression);
        }
        return _super.call(this, query) || this;
    }
    return MultiplicativeExpression;
}(SparqlElement));
var Multiplier = /** @class */ (function (_super) {
    __extends(Multiplier, _super);
    function Multiplier(operator, multiplier) {
        return _super.call(this, "".concat(operator, " ").concat(multiplier)) || this;
    }
    return Multiplier;
}(SparqlElement));
var UnaryExpression = /** @class */ (function (_super) {
    __extends(UnaryExpression, _super);
    function UnaryExpression(expression, operator) {
        return _super.call(this, "".concat(operator).concat(expression)) || this;
    }
    return UnaryExpression;
}(SparqlElement));
var IRIrefOrFunction = /** @class */ (function (_super) {
    __extends(IRIrefOrFunction, _super);
    function IRIrefOrFunction(iriRef, argList) {
        return _super.call(this, "".concat(iriRef).concat(argList)) || this;
    }
    return IRIrefOrFunction;
}(SparqlElement));
var ArgList = /** @class */ (function (_super) {
    __extends(ArgList, _super);
    function ArgList(expression1, expressions) {
        var query = expression1.toString();
        for (var _i = 0, expressions_2 = expressions; _i < expressions_2.length; _i++) {
            var expression = expressions_2[_i];
            query += ", ".concat(expression);
        }
        return _super.call(this, "( ".concat(query, " )")) || this;
    }
    return ArgList;
}(SparqlElement));
var BuiltInCall = /** @class */ (function (_super) {
    __extends(BuiltInCall, _super);
    function BuiltInCall(call) {
        return _super.call(this, call.toString()) || this;
    }
    return BuiltInCall;
}(SparqlElement));
var StringCall = /** @class */ (function (_super) {
    __extends(StringCall, _super);
    function StringCall(expression) {
        return _super.call(this, "STR (".concat(expression, ")")) || this;
    }
    return StringCall;
}(SparqlElement));
var LangCall = /** @class */ (function (_super) {
    __extends(LangCall, _super);
    function LangCall(expression) {
        return _super.call(this, "LANG (".concat(expression, ")")) || this;
    }
    return LangCall;
}(SparqlElement));
var LangMatchesCall = /** @class */ (function (_super) {
    __extends(LangMatchesCall, _super);
    function LangMatchesCall(expression1, expression2) {
        return _super.call(this, "LANGMATCHES (".concat(expression1, ", ").concat(expression2, ")")) || this;
    }
    return LangMatchesCall;
}(SparqlElement));
var DataTypeCall = /** @class */ (function (_super) {
    __extends(DataTypeCall, _super);
    function DataTypeCall(expression) {
        return _super.call(this, "DATATYPE (".concat(expression, ")")) || this;
    }
    return DataTypeCall;
}(SparqlElement));
var BoundCall = /** @class */ (function (_super) {
    __extends(BoundCall, _super);
    function BoundCall(varParameter) {
        return _super.call(this, "BOUND (".concat(varParameter, ")")) || this;
    }
    return BoundCall;
}(SparqlElement));
var SameTermCall = /** @class */ (function (_super) {
    __extends(SameTermCall, _super);
    function SameTermCall(expression1, expression2) {
        return _super.call(this, "sameTerm (".concat(expression1, ", ").concat(expression2, ")")) || this;
    }
    return SameTermCall;
}(SparqlElement));
var IsIRICall = /** @class */ (function (_super) {
    __extends(IsIRICall, _super);
    function IsIRICall(expression) {
        return _super.call(this, "isIRI (".concat(expression, ")")) || this;
    }
    return IsIRICall;
}(SparqlElement));
var IsURICall = /** @class */ (function (_super) {
    __extends(IsURICall, _super);
    function IsURICall(expression) {
        return _super.call(this, "isURI (".concat(expression, ")")) || this;
    }
    return IsURICall;
}(SparqlElement));
var IsBlankCall = /** @class */ (function (_super) {
    __extends(IsBlankCall, _super);
    function IsBlankCall(expression) {
        return _super.call(this, "isBLANK (".concat(expression, ")")) || this;
    }
    return IsBlankCall;
}(SparqlElement));
var IsLiteralCall = /** @class */ (function (_super) {
    __extends(IsLiteralCall, _super);
    function IsLiteralCall(expression) {
        return _super.call(this, "isLITERAL (".concat(expression, ")")) || this;
    }
    return IsLiteralCall;
}(SparqlElement));
var RegexExpression = /** @class */ (function (_super) {
    __extends(RegexExpression, _super);
    function RegexExpression(expression1, expression2, expression3) {
        return _super.call(this, "REGEX (".concat(expression1, ", ").concat(expression2).concat(expression3 ? ", ".concat(expression3) : "", ")")) || this;
    }
    return RegexExpression;
}(SparqlElement));
var FunctionCall = /** @class */ (function (_super) {
    __extends(FunctionCall, _super);
    function FunctionCall(iriRef, argList) {
        return _super.call(this, "".concat(iriRef, " ").concat(argList)) || this;
    }
    return FunctionCall;
}(SparqlElement));
var OptionalGraphPattern = /** @class */ (function (_super) {
    __extends(OptionalGraphPattern, _super);
    function OptionalGraphPattern(pattern) {
        return _super.call(this, "OPTIONAL ".concat(pattern)) || this;
    }
    return OptionalGraphPattern;
}(SparqlElement));
var GroupOrUnionGraphPattern = /** @class */ (function (_super) {
    __extends(GroupOrUnionGraphPattern, _super);
    function GroupOrUnionGraphPattern(pattern, unionPattern) {
        return _super.call(this, "".concat(pattern).concat(unionPattern ? " UNION ".concat(unionPattern) : '')) || this;
    }
    return GroupOrUnionGraphPattern;
}(SparqlElement));
var GraphGraphPattern = /** @class */ (function (_super) {
    __extends(GraphGraphPattern, _super);
    function GraphGraphPattern(varOrIRIRef, pattern) {
        return _super.call(this, "GRAPH ".concat(varOrIRIRef, " ").concat(pattern)) || this;
    }
    return GraphGraphPattern;
}(SparqlElement));
var TriplesBlock = /** @class */ (function (_super) {
    __extends(TriplesBlock, _super);
    function TriplesBlock(subject) {
        return _super.call(this, subject.toString()) || this;
    }
    return TriplesBlock;
}(SparqlElement));
var VarSubject = /** @class */ (function (_super) {
    __extends(VarSubject, _super);
    function VarSubject(varOrTerm, propertyList) {
        return _super.call(this, "".concat(varOrTerm, " ").concat(propertyList)) || this;
    }
    return VarSubject;
}(SparqlElement));
function checkVarName(varname) {
    var varchars = varname.split('');
    var firstChar = varchars.shift();
    if (!PN_CHARS_U(firstChar) && !/[0-9]/.test(firstChar))
        throw 'first char not valid';
    for (var i = 0; i < varchars.length; i++) {
        if (!PN_CHARS_U(firstChar) && !/[0-9]|\u0087|[\u0300-\u036F]|[\u203F-\u2040]/.test(firstChar))
            throw "char index ".concat(i + 1, " is not valid");
    }
    return varname;
}
/**
 * ?
 */
var Var1 = /** @class */ (function (_super) {
    __extends(Var1, _super);
    function Var1(varname) {
        return _super.call(this, "?".concat(checkVarName(varname))) || this;
    }
    return Var1;
}(SparqlElement));
/**
 * $
 */
var Var2 = /** @class */ (function (_super) {
    __extends(Var2, _super);
    function Var2(varname) {
        return _super.call(this, "$".concat(checkVarName(varname))) || this;
    }
    return Var2;
}(SparqlElement));
/**
 * name:thing
 */
var PNAME_LN = /** @class */ (function (_super) {
    __extends(PNAME_LN, _super);
    function PNAME_LN(prefix, local) {
        return _super.call(this, "".concat(new PNAME_NS(prefix)).concat(PN_LOCAL(local))) || this;
    }
    return PNAME_LN;
}(SparqlElement));
/**
 * name:
 */
var PNAME_NS = /** @class */ (function (_super) {
    __extends(PNAME_NS, _super);
    function PNAME_NS(prefix) {
        return _super.call(this, "".concat(PN_PREFIX(prefix), ":")) || this;
    }
    return PNAME_NS;
}(SparqlElement));
function PN_LOCAL(name) {
    var varchars = name.split('');
    var firstChar = varchars.shift();
    if (!PN_CHARS_U(firstChar) && !/[0-9]/.test(firstChar))
        throw 'first char not valid';
    if (varchars.length > 0) {
        var lastChar = varchars.pop();
        if (!PN_CHARS(lastChar))
            throw 'last char not valid';
    }
    for (var i = 0; i < varchars.length; i++) {
        if (!PN_CHARS(firstChar) && firstChar !== '.')
            throw "char index ".concat(i + 1, " is not valid");
    }
    return name;
}
var RDFLiteral = /** @class */ (function (_super) {
    __extends(RDFLiteral, _super);
    function RDFLiteral(name) {
        return _super.call(this, name) || this;
    }
    return RDFLiteral;
}(SparqlElement));
var NumericLiteral = /** @class */ (function (_super) {
    __extends(NumericLiteral, _super);
    function NumericLiteral(num) {
        return _super.call(this, num.toString()) || this;
    }
    return NumericLiteral;
}(SparqlElement));
var BooleanLiteral = /** @class */ (function (_super) {
    __extends(BooleanLiteral, _super);
    function BooleanLiteral(bool) {
        return _super.call(this, bool.toString()) || this;
    }
    return BooleanLiteral;
}(SparqlElement));
var BlankNode = /** @class */ (function (_super) {
    __extends(BlankNode, _super);
    function BlankNode(node) {
        return _super.call(this, node.toString()) || this;
    }
    return BlankNode;
}(SparqlElement));
var BLANK_NODE_LABEL = /** @class */ (function (_super) {
    __extends(BLANK_NODE_LABEL, _super);
    function BLANK_NODE_LABEL(label) {
        return _super.call(this, "_: ".concat(PN_LOCAL(label))) || this;
    }
    return BLANK_NODE_LABEL;
}(SparqlElement));
var ANON = /** @class */ (function (_super) {
    __extends(ANON, _super);
    function ANON(name) {
        return _super.call(this, "[ ".concat(name, " ]")) || this;
    }
    return ANON;
}(SparqlElement));
var NIL = /** @class */ (function (_super) {
    __extends(NIL, _super);
    function NIL(name) {
        return _super.call(this, "( ".concat(name, " )")) || this;
    }
    return NIL;
}(SparqlElement));
var NodeSubject = /** @class */ (function (_super) {
    __extends(NodeSubject, _super);
    function NodeSubject(triplesNode, propertyList) {
        return _super.call(this, "".concat(triplesNode, " ").concat(propertyList)) || this;
    }
    return NodeSubject;
}(SparqlElement));
var Collection = /** @class */ (function (_super) {
    __extends(Collection, _super);
    function Collection(graphNodes) {
        var _this = this;
        if (graphNodes.length > 0) {
            var query;
            for (var _i = 0, graphNodes_1 = graphNodes; _i < graphNodes_1.length; _i++) {
                var graphNode = graphNodes_1[_i];
                query += graphNode;
                _this = _super.call(this, query) || this;
            }
        }
        else
            throw 'graphNodes must be longer than 0';
        return _this;
    }
    return Collection;
}(SparqlElement));
var BlankNodePropertyList = /** @class */ (function (_super) {
    __extends(BlankNodePropertyList, _super);
    function BlankNodePropertyList(propertyList) {
        return _super.call(this, "[ ".concat(propertyList, " ]")) || this;
    }
    return BlankNodePropertyList;
}(SparqlElement));
var PropertyListNotEmpty = /** @class */ (function (_super) {
    __extends(PropertyListNotEmpty, _super);
    function PropertyListNotEmpty(verbObjectLists) {
        var query = verbObjectLists.shift().toString();
        for (var _i = 0, verbObjectLists_1 = verbObjectLists; _i < verbObjectLists_1.length; _i++) {
            var verbObjectList = verbObjectLists_1[_i];
            query += "; ".concat(verbObjectList);
        }
        return _super.call(this, "".concat(query)) || this;
    }
    return PropertyListNotEmpty;
}(SparqlElement));
var VerbObjectList = /** @class */ (function (_super) {
    __extends(VerbObjectList, _super);
    function VerbObjectList(verb, objectList) {
        return _super.call(this, "".concat(verb, " ").concat(objectList)) || this;
    }
    return VerbObjectList;
}(SparqlElement));
var Verb = /** @class */ (function (_super) {
    __extends(Verb, _super);
    function Verb(verb) {
        return _super.call(this, verb.toString()) || this;
    }
    return Verb;
}(SparqlElement));
var ObjectList = /** @class */ (function (_super) {
    __extends(ObjectList, _super);
    function ObjectList(objects) {
        var query = objects.shift().toString();
        for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
            var object = objects_1[_i];
            query += ", ".concat(object);
        }
        return _super.call(this, query) || this;
    }
    return ObjectList;
}(SparqlElement));
var TriplesSameSubject = /** @class */ (function () {
    function TriplesSameSubject() {
    }
    return TriplesSameSubject;
}());
var Distinct = /** @class */ (function (_super) {
    __extends(Distinct, _super);
    function Distinct() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Distinct.prototype.toString = function () {
        return 'DISTINCT ';
    };
    return Distinct;
}(SolutionModifier));
var Reduced = /** @class */ (function (_super) {
    __extends(Reduced, _super);
    function Reduced() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Reduced.prototype.toString = function () {
        return 'REDUCED ';
    };
    return Reduced;
}(SolutionModifier));
var SparqlParams = /** @class */ (function () {
    function SparqlParams() {
    }
    return SparqlParams;
}());
var SparqlSelector = /** @class */ (function () {
    function SparqlSelector(name) {
        this.name = name;
    }
    return SparqlSelector;
}());
var wdt = /** @class */ (function () {
    function wdt(id) {
        this.id = id;
    }
    return wdt;
}());
var wd = /** @class */ (function () {
    function wd(id) {
        this.id = id;
    }
    return wd;
}());
"SELECT ?release ?performer WHERE {\n    ?release wdt:P31 ?performer.\n  }";
var release = new Var1('release'), performer = new Var1('performer');
var hi = new Query({
    queryType: new SelectQuery({
        vars: [release, performer],
        clause: new WhereClause(new GroupGraphPattern(new TriplesBlock(new VarSubject(release, new PropertyListNotEmpty([
            new VerbObjectList(new Verb(new PNAME_LN('wdt', 'P31')), new ObjectList([
                performer
            ]))
        ])))))
    })
});
console.log(hi.toString());
