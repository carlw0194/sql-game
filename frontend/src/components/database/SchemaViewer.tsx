import { useState } from 'react';
import { Table } from '../../types';

/**
 * SchemaViewer Component
 * 
 * This component provides a visual representation of a database schema, showing
 * tables, columns, relationships, and other database objects. It helps players
 * understand the structure of the database they're working with.
 * 
 * Key features:
 * 1. Expandable/collapsible table views
 * 2. Visual indicators for primary keys, foreign keys, and indexes
 * 3. Relationship visualization between tables
 * 4. Row count information for context
 * 5. Data type display for each column
 * 
 * The component is designed to be educational, helping players learn about
 * database design principles while they work with SQL queries.
 * 
 * @param {SchemaViewerProps} props - Component properties
 * @returns {JSX.Element} The rendered schema viewer
 */
interface SchemaViewerProps {
  // The tables to display in the schema viewer
  tables: Table[];
  
  // Whether to show the row count for each table
  showRowCount?: boolean;
  
  // Whether to show the relationships between tables
  showRelationships?: boolean;
  
  // Whether to allow expanding/collapsing tables
  allowCollapse?: boolean;
  
  // Additional CSS classes to apply to the component
  className?: string;
}

const SchemaViewer = ({
  tables,
  showRowCount = true,
  showRelationships = true,
  allowCollapse = true,
  className = ''
}: SchemaViewerProps) => {
  // State for tracking which tables are expanded/collapsed
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>(
    // Initialize all tables as expanded
    tables.reduce((acc, table) => ({ ...acc, [table.name]: true }), {})
  );
  
  /**
   * Toggles the expanded/collapsed state of a table
   * @param {string} tableName - The name of the table to toggle
   */
  const toggleTable = (tableName: string) => {
    if (!allowCollapse) return;
    
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };
  
  /**
   * Expands all tables in the schema
   */
  const expandAllTables = () => {
    const allExpanded = tables.reduce(
      (acc, table) => ({ ...acc, [table.name]: true }),
      {}
    );
    setExpandedTables(allExpanded);
  };
  
  /**
   * Collapses all tables in the schema
   */
  const collapseAllTables = () => {
    const allCollapsed = tables.reduce(
      (acc, table) => ({ ...acc, [table.name]: false }),
      {}
    );
    setExpandedTables(allCollapsed);
  };
  
  /**
   * Finds all foreign key relationships between tables
   * @returns {Array} Array of relationships with source and target information
   */
  const getRelationships = () => {
    if (!showRelationships) return [];
    
    const relationships: {
      sourceTable: string;
      sourceColumn: string;
      targetTable: string;
      targetColumn: string;
    }[] = [];
    
    // Loop through all tables and columns to find foreign key relationships
    tables.forEach(table => {
      table.columns.forEach(column => {
        if (column.isForeign && column.references) {
          // Parse the reference (format: "tableName.columnName")
          const [targetTable, targetColumn] = column.references.split('.');
          
          relationships.push({
            sourceTable: table.name,
            sourceColumn: column.name,
            targetTable,
            targetColumn
          });
        }
      });
    });
    
    return relationships;
  };
  
  // Get all relationships between tables
  const relationships = getRelationships();
  
  return (
    <div className={`schema-viewer ${className}`}>
      {/* Controls for expanding/collapsing all tables */}
      {allowCollapse && tables.length > 1 && (
        <div className="flex justify-end mb-4 space-x-2">
          <button 
            className="text-sm text-gray-400 hover:text-white"
            onClick={expandAllTables}
          >
            Expand All
          </button>
          <button 
            className="text-sm text-gray-400 hover:text-white"
            onClick={collapseAllTables}
          >
            Collapse All
          </button>
        </div>
      )}
      
      {/* Table list */}
      <div className="space-y-4">
        {tables.map(table => (
          <div 
            key={table.name}
            className="bg-gray-800 rounded overflow-hidden"
          >
            {/* Table header */}
            <div 
              className={`p-3 bg-gray-700 flex justify-between items-center ${allowCollapse ? 'cursor-pointer' : ''}`}
              onClick={() => toggleTable(table.name)}
            >
              <div className="flex items-center">
                {allowCollapse && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 mr-2 transition-transform ${expandedTables[table.name] ? 'transform rotate-90' : ''}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <h3 className="font-medium text-lg">{table.name}</h3>
              </div>
              
              {showRowCount && (
                <span className="text-xs text-gray-400">
                  ~{table.rowCount.toLocaleString()} rows
                </span>
              )}
            </div>
            
            {/* Table columns */}
            {expandedTables[table.name] && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-700 bg-opacity-50">
                      <th className="p-2 text-left font-medium">Column</th>
                      <th className="p-2 text-left font-medium">Type</th>
                      <th className="p-2 text-left font-medium">Constraints</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((column, index) => (
                      <tr 
                        key={column.name}
                        className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
                      >
                        <td className="p-2 border-t border-gray-700 font-mono">
                          {column.name}
                        </td>
                        <td className="p-2 border-t border-gray-700 font-mono">
                          {column.type}
                        </td>
                        <td className="p-2 border-t border-gray-700">
                          {/* Primary key indicator */}
                          {column.isPrimary && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900 text-yellow-300 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              PK
                            </span>
                          )}
                          
                          {/* Foreign key indicator */}
                          {column.isForeign && column.references && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-300 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                              </svg>
                              FK → {column.references}
                            </span>
                          )}
                          
                          {/* Index indicator */}
                          {column.hasIndex && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                              </svg>
                              INDEXED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Relationships visualization */}
      {showRelationships && relationships.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Table Relationships</h3>
          
          <div className="bg-gray-800 p-4 rounded">
            <ul className="space-y-2">
              {relationships.map((rel, index) => (
                <li key={index} className="flex items-center">
                  <span className="font-mono text-gray-300">{rel.sourceTable}.{rel.sourceColumn}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="font-mono text-gray-300">{rel.targetTable}.{rel.targetColumn}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaViewer;
