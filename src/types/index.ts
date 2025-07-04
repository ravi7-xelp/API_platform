export interface Api {
  id: string;
  name: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  query_params?: Record<string, string>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  test_results?: TestResult;
  original_request?: any;
  original_response?: any;
}

export interface TestResult {
  success: boolean;
  status_code?: number;
  response_time: number;
  response_body?: any;
  headers?: Record<string, string>;
  error?: string;
}

export interface LoadTestParams {
  url: string;
  method: string;
  concurrent_users: number;
  total_requests: number;
  headers?: Record<string, string>;
  body?: any;
}

export interface LoadTestStatus {
  requests_per_second?: string;
  avg_response_time?: string;
  min_response_time?: string;
  max_response_time?: string;
  failures?: string;
  total_requests?: string;
}

export interface TestCase {
  id: number;
  name: string;
  folder_id: number;
  path: string;
  created_at: string;
}

export interface Folder {
  id: number;
  name: string;
  created_at: string;
  testcases?: TestCase[];
}